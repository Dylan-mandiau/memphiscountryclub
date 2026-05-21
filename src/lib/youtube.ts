/**
 * Extrait l'ID d'une URL YouTube.
 */
export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null
  const patterns: RegExp[] = [
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export const youtubeEmbedUrl = (url: string): string | null => {
  const id = extractYoutubeId(url)
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
}

export const youtubeThumbnail = (url: string): string | null => {
  const id = extractYoutubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}
