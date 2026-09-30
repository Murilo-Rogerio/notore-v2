import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useData } from '../store/DataContext'
import type { Note, NoteKind } from '../lib/types'
import NoteCard from '../components/NoteCard'
import NoteEditor from '../components/NoteEditor'
import { Button, EmptyState, FilterTags, Page, Skeleton } from '../components/ui'

export default function Notes() {
  const { notes, tags, loading } = useData()
  const [filter, setFilter] = useState<string | null>(null)
  const [editor, setEditor] = useState<{ note: Note | null; kind?: NoteKind; due?: string | null } | null>(null)

  const filtered = filter ? notes.filter((n) => n.tag_ids?.includes(filter)) : notes

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Notas & listas</h1>
          <p className="mt-1 text-sm text-ink-2">
            {notes.length === 0 ? 'Nada por aqui ainda' : `${notes.length} guardadas`}
          </p>
        </div>
        <Button onClick={() => setEditor({ note: null, kind: 'note' })}>
          <Plus size={15} /> Nova nota
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : (
        <>
          {tags.length > 0 && <FilterTags tags={tags} active={filter} onChange={setFilter} />}
          {filtered.length === 0 ? (
            <EmptyState
              title={filter ? 'Nada com essa etiqueta' : 'Sua Arca está vazia'}
              hint="Crie uma nota rápida ou uma lista de tarefas — dá para agendar na rotina do dia."
              action={
                <Button onClick={() => setEditor({ note: null, kind: 'note' })}>
                  <Plus size={15} /> Criar a primeira
                </Button>
              }
            />
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
              {filtered.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  tags={tags}
                  onEdit={() => setEditor({ note: n })}
                />
              ))}
            </div>
          )}
        </>
      )}

      <NoteEditor
        open={editor !== null}
        note={editor?.note ?? null}
        defaultKind={editor?.kind ?? 'note'}
        defaultDue={editor?.due ?? null}
        onClose={() => setEditor(null)}
      />
    </Page>
  )
}
