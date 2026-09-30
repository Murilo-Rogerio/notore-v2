import { Check, ListTodo, PenLine, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useData } from '../store/DataContext'
import type { Note, NoteKind, TodoItem } from '../lib/types'
import { cn, todayStr } from '../lib/utils'
import TagPicker from './TagPicker'
import { Button, ConfirmButton, Input, Modal, Textarea, useToast } from './ui'

type Props = {
  open: boolean
  note: Note | null
  defaultKind?: NoteKind
  defaultDue?: string | null
  onClose: () => void
}

const emptyItem = (): TodoItem => ({ id: crypto.randomUUID(), text: '', done: false })

export default function NoteEditor({ open, note, defaultKind = 'note', defaultDue = null, onClose }: Props) {
  const { upsertNote, deleteNote } = useData()
  const toast = useToast()

  const [kind, setKind] = useState<NoteKind>(defaultKind)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [items, setItems] = useState<TodoItem[]>([emptyItem()])
  const [due, setDue] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [focusId, setFocusId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setKind(note?.kind ?? defaultKind)
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setItems(note?.items?.length ? note.items : [emptyItem()])
    setDue(note?.due_at ?? defaultDue ?? '')
    setTagIds(note?.tag_ids ?? [])
  }, [open, note, defaultKind, defaultDue])

  useEffect(() => {
    if (focusId) {
      document.getElementById(`todo-${focusId}`)?.focus()
      setFocusId(null)
    }
  }, [focusId, items])

  const updateItem = (id: string, text: string) =>
    setItems((list) => list.map((i) => (i.id === id ? { ...i, text } : i)))

  const removeItem = (id: string) => setItems((list) => list.filter((i) => i.id !== id))

  const addItem = (afterId?: string) => {
    const item = emptyItem()
    setItems((list) => {
      const idx = afterId ? list.findIndex((i) => i.id === afterId) : list.length - 1
      const copy = [...list]
      copy.splice(idx + 1, 0, item)
      return copy
    })
    setFocusId(item.id)
  }

  const valid =
    title.trim() !== '' || content.trim() !== '' || items.some((i) => i.text.trim() !== '')

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    const cleanItems = items
      .filter((i) => i.text.trim() !== '')
      .map((i) => ({ ...i, text: i.text.trim() }))
    const saved = await upsertNote({
      id: note?.id,
      kind,
      title: title.trim(),
      content: kind === 'note' ? content.trim() || null : null,
      items: kind === 'todo' ? cleanItems : null,
      due_at: due || null,
      tag_ids: tagIds,
    })
    setSaving(false)
    if (saved) {
      toast(note ? 'Nota atualizada' : 'Nota criada')
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={note ? 'Editar' : 'Nova nota'}>
      <div className="space-y-5">
        {!note && (
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-hairline/10 bg-surface/5 p-1">
            {(
              [
                { k: 'note' as NoteKind, label: 'Nota', icon: PenLine },
                { k: 'todo' as NoteKind, label: 'Lista', icon: ListTodo },
              ]
            ).map((opt) => (
              <button
                key={opt.k}
                type="button"
                onClick={() => setKind(opt.k)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium transition',
                  kind === opt.k
                    ? 'bg-surface/80 text-ink shadow-card dark:bg-surface/[0.1]'
                    : 'text-ink-2 hover:text-ink',
                )}
              >
                <opt.icon size={14} /> {opt.label}
              </button>
            ))}
          </div>
        )}

        <Input
          label="Título"
          placeholder="Ex.: Ideias para o vídeo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {kind === 'note' ? (
          <Textarea
            label="Conteúdo"
            placeholder="Escreva à vontade…"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Itens</span>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={it.done ? 'Desmarcar' : 'Concluir'}
                    onClick={() => setItems((l) => l.map((i) => (i.id === it.id ? { ...i, done: !i.done } : i)))}
                    className={cn(
                      'grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition active:scale-90',
                      it.done ? 'border-accent bg-accent text-accent-ink' : 'border-ink-3/50 hover:border-accent',
                    )}
                  >
                    {it.done ? <Check size={11} strokeWidth={3.5} /> : null}
                  </button>
                  <input
                    id={`todo-${it.id}`}
                    value={it.text}
                    onChange={(e) => updateItem(it.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addItem(it.id)
                      }
                      if (e.key === 'Backspace' && it.text === '' && items.length > 1) {
                        e.preventDefault()
                        removeItem(it.id)
                      }
                    }}
                    placeholder="Novo item"
                    className="field flex-1"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      className="icon-btn size-8"
                      aria-label="Remover item"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addItem()}
              className="mt-2.5 flex items-center gap-1 text-[13px] font-medium text-accent"
            >
              <Plus size={13} /> adicionar item
            </button>
          </div>
        )}

        <div className="flex items-end gap-2.5">
          <label className="flex-1">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Agendar na rotina</span>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="field" />
          </label>
          <Button type="button" size="sm" variant="ghost" onClick={() => setDue(todayStr())}>
            Hoje
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setDue('')}>
            Limpar
          </Button>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">Etiquetas</p>
          <TagPicker selected={tagIds} onChange={setTagIds} />
        </div>

        <div className="flex items-center justify-between border-t border-hairline/10 pt-4">
          {note ? (
            <ConfirmButton
              onConfirm={async () => {
                await deleteNote(note.id)
                toast('Nota excluída')
                onClose()
              }}
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button loading={saving} disabled={!valid} onClick={save}>
              {note ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
