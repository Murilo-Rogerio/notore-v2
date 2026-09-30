import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Globe, Link2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { useData } from '../store/DataContext'
import type { Note, NoteKind } from '../lib/types'
import { cn, firstName, greeting, longDate, relativeTime, todayStr } from '../lib/utils'
import NoteEditor from '../components/NoteEditor'
import { Button, Page, Skeleton, useToast } from '../components/ui'

const gridV: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }
const cellV: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Dashboard() {
  const { session, profile } = useAuth()
  const { notes, media, tags, loading } = useData()
  const navigate = useNavigate()
  const toast = useToast()

  const [quickUrl, setQuickUrl] = useState('')
 const [editor, setEditor] = useState<{ note: Note | null; kind?: NoteKind; due?: string | null } | null>(null)

  const name = firstName(profile?.display_name, session?.user?.email)
  const today = todayStr()

  const due = useMemo(
    () =>
      notes
        .filter((n) => n.due_at && n.due_at <= today)
        .sort((a, b) => (a.due_at! < b.due_at! ? -1 : 1)),
    [notes, today],
  )
  const dueDone = due.filter((n) => n.items?.length && n.items.every((i) => i.done)).length
  const progress = due.length ? Math.round((dueDone / due.length) * 100) : 0

  const quickSave = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = quickUrl.trim()
    if (!trimmed) return
    navigate(`/share?url=${encodeURIComponent(trimmed)}`)
    setQuickUrl('')
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-6 md:gap-5">
        <Skeleton className="h-72 md:col-span-4" />
        <Skeleton className="h-72 md:col-span-2" />
        <Skeleton className="h-60 md:col-span-3" />
        <Skeleton className="h-60 md:col-span-3" />
      </div>
    )
  }

  return (
    <Page>
      <motion.div variants={gridV} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-6 md:gap-5">
        {/* Hero: saudação + números + salvamento rápido */}
        <motion.section variants={cellV} className="card p-6 md:col-span-4 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">{longDate()}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {greeting()}, {name}.
              </h1>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-5">
            {[
              { label: 'notas', value: notes.length },
              { label: 'links', value: media.length },
              { label: 'etiquetas', value: tags.length },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-5">
                {i > 0 ? <span className="h-9 w-px bg-hairline/15" /> : null}
                <div>
                  <p className="font-display text-2xl font-semibold">{s.value}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={quickSave} className="mt-6">
            <div className="flex items-center gap-2.5 rounded-2xl border border-hairline/15 bg-surface/60 px-4 py-1.5 transition focus-within:border-accent/50 focus-within:ring-[3px] focus-within:ring-accent/15 dark:bg-surface/[0.06]">
              <Link2 size={16} className="shrink-0 text-ink-3" />
              <input
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                placeholder="Cole um link do TikTok, YouTube, Instagram…"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-ink-3/70"
              />
              <Button type="submit" size="sm" disabled={!quickUrl.trim()}>
                Guardar
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Rotina de hoje */}
        <motion.section variants={cellV} className="card p-5 md:col-span-2 md:p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">rotina · hoje</p>
            <span className="font-mono text-[11px] text-ink-3">
              {due.length ? `${dueDone}/${due.length}` : '—'}
            </span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-hairline/10">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 -mx-2">
            {due.length === 0 ? (
              <div className="px-2 py-6 text-center">
                <p className="text-sm text-ink-2">Nada agendado para hoje.</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3"
                  onClick={() => setEditor({ note: null, kind: 'todo', due: today })}
                >
                  <Plus size={13} /> Planejar o dia
                </Button>
              </div>
            ) : (
              due.map((n) => {
                const total = n.items?.length ?? 0
                const ok = n.items?.filter((i) => i.done).length ?? 0
                const complete = total > 0 && ok === total
                return (
                  <button
                    key={n.id}
                    onClick={() => setEditor({ note: n })}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-surface/50 dark:hover:bg-surface/[0.05]"
                  >
                    <span
                      className={cn(
                        'size-2.5 shrink-0 rounded-full',
                        complete ? 'bg-accent' : 'border border-ink-3/60',
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{n.title || 'Sem título'}</span>
                    {n.kind === 'todo' && total > 0 ? (
                      <span className="font-mono text-[11px] text-ink-3">
                        {ok}/{total}
                      </span>
                    ) : null}
                    {n.due_at! < today ? (
                      <span className="font-mono text-[10px] uppercase text-accent">atrasada</span>
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </motion.section>

        {/* Mídias recentes */}
        <motion.section variants={cellV} className="card p-5 md:col-span-3 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">mídias recentes</p>
            <Link to="/media" className="flex items-center gap-1 text-[13px] font-medium text-accent">
              ver tudo <ArrowRight size={12} />
            </Link>
          </div>
          {media.length === 0 ? (
            <p className="py-4 text-sm text-ink-3">Nenhum link guardado ainda — cole um ali em cima.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {media.slice(0, 2).map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-hairline/10 p-2.5 transition hover:border-accent/30"
                >
                  <span className="block h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface/10">
                    {m.thumbnail_url ? (
                      <img src={m.thumbnail_url} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-ink-3">
                        <Globe size={14} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-[13px] font-medium">{m.title ?? m.url}</span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wide text-ink-3">
                      {m.provider}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </motion.section>

        {/* Notas recentes */}
        <motion.section variants={cellV} className="card p-5 md:col-span-3 md:p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">notas recentes</p>
            <Link to="/notes" className="flex items-center gap-1 text-[13px] font-medium text-accent">
              ver tudo <ArrowRight size={12} />
            </Link>
          </div>
          {notes.length === 0 ? (
            <p className="py-4 text-sm text-ink-3">Suas notas aparecem aqui. Crie a primeira em Notas.</p>
          ) : (
            <div className="divide-y divide-hairline/10">
              {notes.slice(0, 3).map((n) => (
                <button
                  key={n.id}
                  onClick={() => setEditor({ note: n })}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span className="pill shrink-0">{n.kind === 'todo' ? 'lista' : 'nota'}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{n.title || 'Sem título'}</span>
                  <span className="shrink-0 font-mono text-[11px] text-ink-3">
                    {relativeTime(n.updated_at)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>

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
