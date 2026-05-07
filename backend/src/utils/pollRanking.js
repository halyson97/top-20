function computePollRanking(poll, votes) {
  const map = new Map(poll.songs.map((song) => [String(song._id), { likes: 0, dislikes: 0 }]));

  for (const vote of votes) {
    for (const item of vote.votes) {
      const bucket = map.get(String(item.songId));
      if (!bucket) continue;
      if (item.liked) bucket.likes += 1;
      else bucket.dislikes += 1;
    }
  }

  const ranking = poll.songs
    .map((song) => {
      const scoreItem = map.get(String(song._id)) || { likes: 0, dislikes: 0 };
      return {
        songId: song._id,
        name: song.name,
        artist: song.artist,
        thumbnail: song.thumbnail,
        likes: scoreItem.likes,
        dislikes: scoreItem.dislikes,
        score: scoreItem.likes - scoreItem.dislikes,
      };
    })
    .sort((a, b) => b.score - a.score);

  const totalVotes = ranking.reduce((sum, item) => sum + item.likes, 0);
  const totalDislikes = ranking.reduce((sum, item) => sum + item.dislikes, 0);

  return {
    ranking,
    participants: votes.length,
    totalVotes,
    totalDislikes,
  };
}

module.exports = { computePollRanking };
