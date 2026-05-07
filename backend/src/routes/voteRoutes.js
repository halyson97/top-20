const express = require("express");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");
const { computePollRanking } = require("../utils/pollRanking");

const router = express.Router();

router.post("/vote", async (req, res) => {
  const { pollId, name, email, instagram, votes } = req.body;

  if (!pollId || !name || !email || !instagram || !Array.isArray(votes)) {
    return res.status(400).json({ message: "Dados de voto inválidos." });
  }

  const poll = await Poll.findById(pollId);
  if (!poll) return res.status(404).json({ message: "Votação não encontrada." });
  if (!poll.active || new Date(poll.endDate) < new Date()) {
    return res.status(400).json({ message: "Votação encerrada." });
  }

  const normalizedEmail = email.toLowerCase();
  const existingVote = await Vote.findOne({ pollId, email: normalizedEmail });
  if (existingVote) {
    return res.status(409).json({ message: "Este email já votou nesta votação." });
  }

  await Vote.create({
    pollId,
    name,
    email: normalizedEmail,
    instagram,
    votes: votes.map((v) => ({ songId: v.songId, liked: !!v.liked })),
  });

  return res.status(201).json({ message: "Voto registrado com sucesso." });
});

router.get("/results/:pollId", async (req, res) => {
  const poll = await Poll.findById(req.params.pollId).lean();
  if (!poll) return res.status(404).json({ message: "Votação não encontrada." });

  const votes = await Vote.find({ pollId: req.params.pollId }).lean();
  const { ranking, participants, totalVotes, totalDislikes } = computePollRanking(poll, votes);

  res.json({
    poll: {
      id: poll._id,
      name: poll.name,
      description: poll.description,
      endDate: poll.endDate,
      active: poll.active,
    },
    participants,
    totalVotes,
    totalDislikes,
    ranking,
  });
});

module.exports = router;
