import { youtubeEmbedUrl } from '@/lib/youtube'

type Props = {
  url: string
  title: string
}

export const YouTubeEmbed = ({ url, title }: Props) => {
  const src = youtubeEmbedUrl(url)
  if (!src) return null
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-border bg-surface"
      style={{ aspectRatio: '16/9' }}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
