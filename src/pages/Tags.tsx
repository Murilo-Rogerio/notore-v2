import { Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useData } from '../store/DataContext'
import { TAG_COLORS, type Tag } from '../lib/types'
import { cn } from '../lib/utils'
import { Button, ConfirmButton, EmptyState, Input, Modal, Page, Skeleton, useToast } from '../components/ui'

export default function Tags() {
  const { tags, notes, media, loading, createTag, deleteTag } = useData()
  const toast = useToast()
  const [dlg, setDlg] = useState<{ open: boolean; tag: Tag | null }>({ open: false, tag: null })
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(TAG_COLORS[0])
  const [busy, setBusy] = useState(false)

  const usage = useMemo(() => {
    const map = new Map<string, { notes: number; media: number }>()
    tags.forEach((t) => map.set(t.id, { notes: 0, media: 0 }))
    notes.forEach((n) =>
      n.tag_ids?.forEach((id) => {
        const u = map.get(id)
        if (u) u.notes++
      }),
    )
    media.forEach((m) =>
      m.tag_ids?.forEach((id) => {
        const u = map.get(id)
        if (u) u.media++
      }),
    )
    return map
  }, [tags, notes, media])

  const openDialog = (tag: Tag | null) => {
    setDlg({ open: true, tag })
    setName(tag?.name ?? '')
    setColor(tag?.color ?? TAG_COLORS[0])
  }

  const closeDialog = () => setDlg({ open: false, tag: null })

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    const created = await createTag(trimmed, color)
    setBusy(false)
    if (created) {
      toast(dlg.tag ? 'Etiqueta atualizada' : 'Etiqueta criada')
      closeDialog()
    }
  }

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Etiquetas</h1>
          <p className="mt-1 text-sm text-ink-2">Organize notas e links por cor e assunto.</p>
        </div>
        <Button onClick={() => openDialog(null)}>
          <Plus size={15} /> Nova etiqueta
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <EmptyState
          title="Nenhuma etiqueta ainda"
          hint="Crie etiquetas como “receitas”, “treino” ou “vídeos para assistir depois”."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((t) => {
            const u = usage.get(t.id)!
            return (
              <div key={t.id} className="card flex items-center gap-4 p-4">
                <span className="size-6 shrink-0 rounded-full" style={{ background: t.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-3">
                    {u.notes} notas · {u.media} links
                  </p>
                </div>
                <button onClick={() => openDialog(t)} className="icon-btn size-8" aria-label={`Editar ${t.name}`}>
                  <Pencil size={13} />
                </button>
                <ConfirmButton onConfirm={() => deleteTag(t.id)} />
              </div>
            )
          })}
        </div>
      )}

      <Modal open={dlg.open} onClose={closeDialog} title={dlg.tag ? 'Editar etiqueta' : 'Nova etiqueta'}>
        <div className="space-y-5">
          <Input
            label="Nome"
            placeholder="Ex.: assistir depois"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-2">Cor</p>
            <div className="flex flex-wrap gap-2.5">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Cor ${c}`}
                  className={cn(
                    'size-9 rounded-full transition',
                    color === c && 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-bg',
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2.5 border-t border-hairline/10 pt-4">
            <Button variant="ghost" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button loading={busy} disabled={!name.trim()} onClick={submit}>
              {dlg.tag ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  )
}
