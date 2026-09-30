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
    notes.forEach((n) => n.tag_ids?.forEach((id) => map.get(id)?.notes++ !== undefined || true))
    // (contagem simples abaixo, sem encadeamento)
    let _: undefined
    void _
    return map
  }, [tags, notes, media])
