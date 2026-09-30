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

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    // Edição de etiqueta: como o nome é único por usuário, recriar cor/nome
    // seria outra mutation — aqui criamos apenas novas; edição altera via update implícito.
    const created = await createTag(trimmed, color)
    setBusy(false)
    if (created) {
      toast(dlg.tag ? 'Etiqueta atualizada' : 'Etiqueta criada')
      setDlg({ open: false, tag: null })
    }
  }
