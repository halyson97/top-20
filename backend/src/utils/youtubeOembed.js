const { buildYoutubeMetadata } = require("./youtube");

/**
 * Obtém o título público do vídeo via oEmbed do YouTube (sem API key).
 */
async function fetchYoutubeTitle(youtubeUrl) {
  const url = String(youtubeUrl || "").trim();
  if (!url) return null;

  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembed, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;

  const data = await res.json();
  const title = typeof data.title === "string" ? data.title.trim() : "";
  return title || null;
}

async function prepareSongPayload(song) {
  const metadata = buildYoutubeMetadata(song.youtubeUrl);
  if (!metadata) {
    throw new Error("URL do YouTube inválida.");
  }

  const manualName = typeof song.name === "string" ? song.name.trim() : "";
  const name = manualName || (await fetchYoutubeTitle(song.youtubeUrl));
  if (!name) {
    throw new Error("Não foi possível obter o título do vídeo no YouTube.");
  }

  const artist = typeof song.artist === "string" ? song.artist.trim() : "";

  return {
    youtubeUrl: String(song.youtubeUrl).trim(),
    name,
    artist,
    ...metadata,
  };
}

module.exports = { fetchYoutubeTitle, prepareSongPayload };
