import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { useData } from '../store/DataContext'
import { TAG_COLORS } from '../lib/types'
import { cn } from '../lib/utils'
import { Button } from './ui'

export default function TagPicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const { tags, createTag } = useData()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(TAG_COLORS[0])
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    const tag = await createTag(trimmed, color)
    setBusy(false)
    if (tag) {
      onChange([...selected, tag.id])
      setName('')
      setAdding(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((t) => {
          const on = selected.includes(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(on ? selected.filter((i) => i !== t.id) : [...selected, t.id])}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                !on && 'border-hairline/15 text-ink-2 hover:text-ink',
              )}
              style={on ? { color: t.color, borderColor: `${t.color}66`, background: `${t.color}1f` } : undefined}
            >
              <span className="size-2 rounded-full" style={{ background: t.color }} />
              {t.name}
              {on ? <Check size={11} strokeWidth={3} /> : null}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="flex items-center gap-1 rounded-full border border-dashed border-hairline/25 px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-hairline/40 hover:text-ink"
        >
          <Plus size={12} /> nova
        </button>
      </div>

      {adding && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Nome da etiqueta"
            className="field min-w-40 flex-1 py-1.5 text-xs"
          />
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Cor ${c}`}
              className={cn(
                'size-5 rounded-full transition',
                color === c && 'scale-125 ring-2 ring-ink ring-offset-2 ring-offset-bg',
              )}
              style={{ background: c }}
            />
          ))}
          <Button type="button" size="sm" loading={busy} onClick={submit}>
            Criar
          </Button>
        </div>
      )}
    </div>
  )
}
