const express = require("express");
const slugify = require("slugify");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");
const auth = require("../middleware/auth");
const { prepareSongPayload } = require("../utils/youtubeOembed");
const { computePollRanking } = require("../utils/pollRanking");
const mongoose = require("mongoose");

const router = express.Router();

function getPollStats(poll, votes) {
  const participants = votes.length;
  let totalLikes = 0;
  let totalDislikes = 0;
  for (const vote of votes) {
    for (const item of vote.votes) {
      if (item.liked) totalLikes += 1;
      else totalDislikes += 1;
    }
  }

  return {
    participants,
    totalVotes: totalLikes,
    totalDislikes,
    score: totalLikes - totalDislikes,
    active: poll.active && new Date(poll.endDate) > new Date(),
  };
}

function isPollOwner(poll, adminId) {
  return poll && poll.createdBy && String(poll.createdBy) === String(adminId);
}

router.get("/polls", auth, async (req, res) => {
  const polls = await Poll.find({ createdBy: req.admin.adminId }).sort({ createdAt: -1 }).lean();
  const pollIds = polls.map((p) => p._id);
  const votes = await Vote.find({ pollId: { $in: pollIds } }).lean();

  const byPoll = new Map();
  for (const vote of votes) {
    const list = byPoll.get(String(vote.pollId)) || [];
    list.push(vote);
    byPoll.set(String(vote.pollId), list);
  }

  const data = polls.map((poll) => {
    const stats = getPollStats(poll, byPoll.get(String(poll._id)) || []);
    return { ...poll, stats };
  });

  res.json(data);
});

router.post("/polls", auth, async (req, res) => {
  const { name, description, endDate, songs } = req.body;
  if (!name || !description || !endDate || !Array.isArray(songs) || songs.length === 0) {
    return res.status(400).json({ message: "Dados de votação inválidos." });
  }

  let baseSlug = slugify(name, { lower: true, strict: true });
  if (!baseSlug) baseSlug = `votacao-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;
  while (await Poll.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  let preparedSongs;
  try {
    preparedSongs = await Promise.all(songs.map((song) => prepareSongPayload(song)));
  } catch (err) {
    return res.status(400).json({ message: err.message || "Erro ao processar músicas." });
  }

  const poll = await Poll.create({
    name,
    description,
    endDate,
    songs: preparedSongs,
    slug,
    createdBy: req.admin.adminId,
  });
  res.status(201).json(poll);
});

router.get("/polls/:pollId/report", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.pollId)) {
    return res.status(404).json({ message: "Votação não encontrada." });
  }

  const poll = await Poll.findById(req.params.pollId).lean();
  if (!poll || !isPollOwner(poll, req.admin.adminId)) {
    return res.status(404).json({ message: "Votação não encontrada." });
  }

  const votes = await Vote.find({ pollId: req.params.pollId }).sort({ createdAt: -1 }).lean();
  const summary = computePollRanking(poll, votes);
  const songById = new Map(poll.songs.map((s) => [String(s._id), s]));

  const ballots = votes.map((v) => ({
    id: v._id,
    name: v.name,
    email: v.email,
    instagram: v.instagram,
    createdAt: v.createdAt,
    choices: v.votes.map((item) => ({
      songId: item.songId,
      songName: songById.get(String(item.songId))?.name || "—",
      liked: item.liked,
    })),
  }));

  res.json({
    poll: {
      id: poll._id,
      name: poll.name,
      description: poll.description,
      endDate: poll.endDate,
      active: poll.active,
      slug: poll.slug,
      createdAt: poll.createdAt,
      closedAt: poll.closedAt,
    },
    ...summary,
    ballots,
  });
});

router.get("/polls/:id", async (req, res) => {
  const field = req.params.id.length === 24 ? "_id" : "slug";
  const poll = await Poll.findOne({ [field]: req.params.id });
  if (!poll) return res.status(404).json({ message: "Votação não encontrada." });
  res.json(poll);
});

router.put("/polls/:id", auth, async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll || !isPollOwner(poll, req.admin.adminId)) {
    return res.status(404).json({ message: "Votação não encontrada." });
  }

  const { name, description, endDate, active, songs } = req.body;
  if (name) poll.name = name;
  if (description) poll.description = description;
  if (endDate) poll.endDate = endDate;
  if (typeof active === "boolean") {
    poll.active = active;
    if (!active) poll.closedAt = new Date();
  }

  if (Array.isArray(songs) && songs.length > 0) {
    try {
      poll.songs = await Promise.all(songs.map((song) => prepareSongPayload(song)));
    } catch (err) {
      return res.status(400).json({ message: err.message || "Erro ao processar músicas." });
    }
  }

  await poll.save();
  res.json(poll);
});

router.delete("/polls/:id", auth, async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll || !isPollOwner(poll, req.admin.adminId)) {
    return res.status(404).json({ message: "Votação não encontrada." });
  }
  await Poll.findByIdAndDelete(req.params.id);
  await Vote.deleteMany({ pollId: req.params.id });
  res.status(204).send();
});

module.exports = router;
