import { motion } from 'framer-motion'
import { ExternalLink, Globe } from 'lucide-react'
import { useData } from '../store/DataContext'
import type { MediaItem, Tag } from '../lib/types'
import { cn, hostOf, relativeTime } from '../lib/utils'
import { ConfirmButton, TagPill } from './ui'

export default function MediaCard({ item, tags }: { item: MediaItem; tags: Tag[] }) {
  const { deleteMedia } = useData()
  const myTags = tags.filter((t) => item.tag_ids?.includes(t.id))
  const vertical = item.provider === 'tiktok'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card group mb-5 break-inside-avoid overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/25"
    >
      <a href={item.url} target="_blank" rel="noreferrer">
        <div className={cn('relative overflow-hidden', vertical ? 'aspect-[4/5]' : 'aspect-video')}>
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.title ?? item.url}
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid size-full place-items-center bg-surface/5 text-ink-3">
              <Globe size={22} />
            </div>
          )}
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-accent" />
            {item.provider}
          </span>
          <span className="absolute bottom-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
            <ExternalLink size={14} />
          </span>
        </div>
      </a>

      <div className="p-4">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="line-clamp-2 text-sm font-medium leading-snug transition-colors hover:text-accent"
        >
          {item.title ?? item.url}
        </a>
        <p className="mt-1 truncate font-mono text-[11px] text-ink-3">{hostOf(item.url)}</p>

        {myTags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {myTags.map((t) => (
              <TagPill key={t.id} tag={t} />
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-hairline/10 pt-3">
          <span className="font-mono text-[11px] text-ink-3">{relativeTime(item.created_at)}</span>
          <div className="flex items-center gap-1">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="icon-btn size-8"
              aria-label="Abrir link original"
            >
              <ExternalLink size={14} />
            </a>
            <ConfirmButton onConfirm={() => deleteMedia(item.id)} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
