import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useData } from '../store/DataContext'
import type { Note, Tag } from '../lib/types'
import { cn, relativeTime } from '../lib/utils'
import { ConfirmButton, DueBadge, TagPill } from './ui'

export default function NoteCard({
  note,
  tags,
  onEdit,
}: {
  note: Note
  tags: Tag[]
  onEdit: () => void
}) {
  const { toggleTodo, deleteNote } = useData()
  const myTags = tags.filter((t) => note.tag_ids?.includes(t.id))
  const items = note.items ?? []
  const visible = items.slice(0, 4)
  const done = items.filter((i) => i.done).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card group mb-5 break-inside-avoid p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/25"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="pill">{note.kind === 'todo' ? 'lista' : 'nota'}</span>
        {note.due_at ? <DueBadge due={note.due_at} /> : null}
      </div>

      <button onClick={onEdit} className="mt-3 block w-full text-left">
        <h3 className="font-display text-[15px] font-semibold leading-snug transition-colors group-hover:text-accent">
          {note.title || 'Sem título'}
        </h3>
      </button>

      {note.kind === 'note' && note.content ? (
        <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-ink-2">
          {note.content}
        </p>
      ) : null}

      {note.kind === 'todo' && visible.length > 0 && (
        <ul className="mt-3 space-y-2">
          {visible.map((it) => (
            <li key={it.id} className="flex items-start gap-2.5">
              <button
                onClick={() => toggleTodo(note.id, it.id)}
                aria-label={it.done ? 'Desmarcar' : 'Concluir'}
                className={cn(
                  'mt-0.5 grid size-[17px] shrink-0 place-items-center rounded-[5px] border transition active:scale-90',
                  it.done ? 'border-accent bg-accent text-accent-ink' : 'border-ink-3/50 hover:border-accent',
                )}
              >
                {it.done ? <Check size={11} strokeWidth={3.5} /> : null}
              </button>
              <span className={cn('text-sm leading-snug', it.done ? 'text-ink-3 line-through' : 'text-ink')}>
                {it.text}
              </span>
            </li>
          ))}
          {items.length > 4 && (
            <li className="pl-7 font-mono text-[11px] text-ink-3">+{items.length - 4} itens</li>
          )}
        </ul>
      )}

      {myTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {myTags.map((t) => (
            <TagPill key={t.id} tag={t} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-hairline/10 pt-3">
        <span className="font-mono text-[11px] text-ink-3">
          {note.kind === 'todo' && items.length > 0 ? `${done}/${items.length} · ` : ''}
          {relativeTime(note.updated_at)}
        </span>
        <ConfirmButton onConfirm={() => deleteNote(note.id)} />
      </div>
    </motion.div>
  )
}
