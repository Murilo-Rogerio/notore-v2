import { Bookmark, Globe, Link2, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { detectProvider, fetchLinkMeta, normalizeUrl, type LinkMeta } from '../lib/metadata'
import { useData } from '../store/DataContext'
import TagPicker from './TagPicker'
import { Button } from './ui'

type Props = {
  initialUrl?: string
  initialTitle?: string
  onSaved: (item: import('../lib/types').MediaItem) => void
  onCancel?: () => void
}

/** Núcleo do módulo de mídias: input de URL, preview via oEmbed, etiquetas e save. */
export default function MediaSaver({ initialUrl = '', initialTitle = '', onSaved, onCancel }: Props) {
  const { saveMedia } = useData()

  const [url, setUrl] = useState(initialUrl)
  const [title, setTitle] = useState(initialTitle)
  const [meta, setMeta] = useState<LinkMeta | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [imgFail, setImgFail] = useState(false)

  // Espelho do título em ref, para a busca não sobrescrever o que o usuário digitou.
  const titleRef = useRef({ value: initialTitle, edited: false })

  useEffect(() => {
    const normalized = normalizeUrl(url)
    setImgFail(false)
    if (!normalized) {
      setMeta(null)
      setStatus('idle')
      return
    }
    let alive = true
    setStatus('loading')
    const timer = window.setTimeout(() => {
      fetchLinkMeta(normalized, titleRef.current.edited ? null : titleRef.current.value)
        .then((m) => {
          if (!alive) return
          setMeta(m)
          setStatus('ready')
          if (!titleRef.current.edited && m.title) setTitle(m.title)
        })
        .catch(() => {
          if (!alive) return
          setMeta({ url: normalized, provider: detectProvider(normalized), title: null, author: null, thumbnail: null })
          setStatus('ready')
        })
    }, 600)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [url])

  const normalized = normalizeUrl(url)
  const canSave = !!normalized && !saving

  const save = async () => {
    if (!normalized || saving) return
    setSaving(true)
    const item = await saveMedia({
      url: normalized,
      provider: meta?.provider ?? detectProvider(normalized),
      title: title.trim() || meta?.title || null,
      thumbnail_url: meta?.thumbnail ?? null,
      tag_ids: tagIds,
    })
    setSaving(false)
    if (item) onSaved(item)
  }

  return (
    <div className="space-y-5">
      {/* Campo de URL */}
      <div className="field flex items-center gap-2.5">
        <Link2 size={16} className="shrink-0 text-ink-3" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              save()
            }
          }}
          placeholder="Cole o link aqui (TikTok, YouTube, Instagram…)"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-3/70"
        />
        {status === 'loading' ? <Loader2 size={15} className="shrink-0 animate-spin text-ink-3" /> : null}
      </div>

      {/* Preview dos metadados */}
      {normalized && (
        <div className="rounded-2xl border border-hairline/10 bg-surface/5 p-3 dark:bg-surface/[0.03]">
          {status === 'loading' ? (
            <div className="flex gap-3.5">
              <div className="aspect-video w-36 shrink-0 animate-pulse rounded-xl bg-surface/10" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-24 animate-pulse rounded bg-surface/10" />
                <div className="h-4 w-full animate-pulse rounded bg-surface/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-surface/10" />
              </div>
            </div>
          ) : (
            <div className="flex gap-3.5">
              {meta?.thumbnail && !imgFail ? (
                <img
                  src={meta.thumbnail}
                  alt=""
                  onError={() => setImgFail(true)}
                  className="aspect-video w-36 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="grid aspect-video w-36 shrink-0 place-items-center rounded-xl border border-hairline/10 bg-surface/5 text-ink-3">
                  <Globe size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="pill">
                    <span className="size-1.5 rounded-full bg-accent" />
                    {meta?.provider ?? 'link'}
                  </span>
                  {meta?.author ? (
                    <span className="truncate font-mono text-[10px] text-ink-3">{meta.author}</span>
                  ) : null}
                </div>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    titleRef.current = { value: e.target.value, edited: true }
                  }}
                  placeholder="Dê um título (opcional)"
                  className="mt-2 w-full bg-transparent text-sm font-medium outline-none placeholder:text-ink-3/70"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-[13px] font-medium text-ink-2">Etiquetas</p>
        <TagPicker selected={tagIds} onChange={setTagIds} />
      </div>

      <div className="flex gap-2.5">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button className="flex-1" loading={saving} disabled={!canSave} onClick={save}>
          <Bookmark size={15} /> Arquivar link
        </Button>
      </div>
    </div>
  )
}
