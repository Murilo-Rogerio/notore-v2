import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useData } from '../store/DataContext'
import { TAG_COLORS } from '../lib/types'
import { cn } from '../lib/utils'
import { Button, ConfirmButton, EmptyState, Page, Skeleton, useToast } from '../components/ui'

export default function Tags() {
  const { tags, notes, media, loading, createTag, deleteTag } = useData()
  const toast = useToast()
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(TAG_COLORS[0])
  const [busy, setBusy] = useState(false)

  const countOf = (id: string) =>
    notes.filter((n) => n.tag_ids?.includes(id)).length +
    media.filter((m) => m.tag_ids?.includes(id)).length

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    const created = await createTag(trimmed, color)
    setBusy(false)
    if (created) {
      toast('Etiqueta criada')
      setName('')
    }
  }

  return (
    <Page>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight">Etiquetas</h1>

      <div className="card mb-6 flex flex-wrap items-center gap-3 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="Nova etiqueta (ex.: assistir depois)"
          className="field min-w-48 flex-1"
        />
        {TAG_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={c}
            className={cn(
              'size-6 shrink-0 rounded-full transition',
              color === c && 'scale-125 ring-2 ring-ink ring-offset-2 ring-offset-bg',
            )}
            style={{ background: c }}
          />
        ))}
        <Button size="sm" loading={busy} disabled={!name.trim()} onClick={submit}>
          <Plus size={14} /> Criar
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-20" />
      ) : tags.length === 0 ? (
        <EmptyState
          title="Nenhuma etiqueta ainda"
          hint="Crie etiquetas para organizar suas notas e links por assunto."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((t) => (
            <div key={t.id} className="card flex items-center gap-4 p-4">
              <span className="size-6 shrink-0 rounded-full" style={{ background: t.color }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.name}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-3">
                  {countOf(t.id)} itens
                </p>
              </div>
              <ConfirmButton onConfirm={() => deleteTag(t.id)} />
            </div>
          ))}
        </div>
      )}
    </Page>
  )
}
