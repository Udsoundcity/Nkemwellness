// Small helpers for working with admin-supplied media (uploaded files,
// direct URLs, or YouTube links) across the hero slider, reviews, etc.

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
];

export function extractYouTubeId(url) {
  if (!url) return null;
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function youTubeThumbnail(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function youTubeEmbedUrl(youtubeId, { autoplay = false, loop = false } = {}) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1"
  });
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
    params.set("controls", "0");
  }
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", youtubeId);
  }
  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
}

/** Given a raw URL pasted by the admin, guess whether it's a YouTube link,
 * a direct video file, or an image — used so the media picker doesn't need
 * the admin to declare the type up front. */
export function guessMediaType(url) {
  if (!url) return "image";
  if (extractYouTubeId(url)) return "video";
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) return "video";
  return "image";
}
