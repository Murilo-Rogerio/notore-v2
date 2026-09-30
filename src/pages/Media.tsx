import { Bookmark, Plus } from 'lucide-react'
import { useState } from 'react'
import { useData } from '../store/DataContext'
import MediaCard from '../components/MediaCard'
import MediaSaver from '../components/MediaSaver'
import { Button, EmptyState, FilterTags, Modal, Page, Skeleton, useToast } from '../components/ui'

export default function Media() {
  const { media, tags, loading } = useData()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  const filtered = filter ? media.filter((m) => m.tag_ids?.includes(filter)) : media

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Mídias</h1>
          <p className="mt-1 text-sm text-ink-2">
            {media.length === 0 ? 'Nenhum link guardado' : `${media.length} links na coleção`}
          </p>
        </div>
        <Button onClick={() => setSaving(true)}>
          <Plus size={15} /> Guardar link
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <>
          {tags.length > 0 && <FilterTags tags={tags} active={filter} onChange={setFilter} />}
          {filtered.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title={filter ? 'Nada com essa etiqueta' : 'Coleção vazia'}
              hint="Guarde vídeos do TikTok, Reels, posts e artigos com preview automático."
              action={
                <Button onClick={() => setSaving(true)}>
                  <Plus size={15} /> Guardar link
                </Button>
              }
            />
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {filtered.map((m) => (
                <MediaCard key={m.id} item={m} tags={tags} />
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={saving} onClose={() => setSaving(false)} title="Guardar link">
        <MediaSaver
          onSaved={() => {
            setSaving(false)
            toast('Link arquivado')
          }}
          onCancel={() => setSaving(false)}
        />
      </Modal>
    </Page>
  )
}
