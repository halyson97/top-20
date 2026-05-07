function extractYoutubeVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    if (parsed.hostname.includes("youtube.com")) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) return fromQuery;
      const parts = parsed.pathname.split("/");
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }
  } catch (_error) {
    return null;
  }

  return null;
}

function buildYoutubeMetadata(youtubeUrl) {
  const id = extractYoutubeVideoId(youtubeUrl);
  if (!id) return null;

  return {
    youtubeVideoId: id,
    thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
  };
}

module.exports = { buildYoutubeMetadata };
