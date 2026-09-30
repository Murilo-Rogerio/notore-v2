import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CalendarDays, Check, CheckCircle2, Loader2, Trash2, X, Inbox } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../hooks/useTheme'
import type { Tag } from '../lib/types'
import { cn, dueLabel, todayStr } from '../lib/utils'

/* ---------- Marca ---------- */

export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4.75 10.25a7.25 7.25 0 0 1 14.5 0" />
      <rect x="3.75" y="10.25" width="16.5" height="9" rx="3.25" />
      <path d="M12 13.75v2.5" />
    </svg>
  )
}

export function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  )
}

/* ---------- Primitivos ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'soft' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={loading || disabled ? undefined : { scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-60',
        size === 'sm' ? 'px-3 py-1.5 text-[13px]' : 'px-4 py-2.5 text-sm',
        variant === 'primary' && 'bg-accent text-accent-ink shadow-glow hover:bg-accent/90',
        variant === 'ghost' &&
          'border border-hairline/15 text-ink hover:border-hairline/30 hover:bg-surface/5',
        variant === 'soft' && 'border border-hairline/10 bg-surface/10 text-ink hover:bg-surface/15',
        variant === 'danger' && 'border border-red-500/30 text-red-500 hover:bg-red-500/10 dark:text-red-400',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : null}
      {children}
    </motion.button>
  )
}

type FieldProps<T> = Omit<T, 'className'> & { label?: string; error?: string; className?: string }

export function Input({
  label,
  error,
  className,
  ...rest
}: FieldProps<InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span> : null}
      <input className={cn('field', error && 'border-red-500/50', className)} {...rest} />
      {error ? <span className="mt-1.5 block text-xs text-red-500 dark:text-red-400">{error}</span> : null}
    </label>
  )
}

export function Textarea({
  label,
  className,
  ...rest
}: FieldProps<TextareaHTMLAttributes<HTMLTextAreaElement>>) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span> : null}
      <textarea className={cn('field resize-none', className)} {...rest} />
    </label>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-lg rounded-t-3xl border border-hairline/10 bg-bg shadow-pop sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-hairline/10 px-5 py-4">
              <h2 className="font-display text-base font-semibold">{title}</h2>
              <button className="icon-btn" onClick={onClose} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[70dvh] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ---------- Toast ---------- */

type ToastKind = 'success' | 'error'
type ToastMsg = { id: number; text: string; kind: ToastKind }
type ShowToast = (text: string, kind?: ToastKind) => void

const ToastCtx = createContext<ShowToast>(() => {})
let toastSeq = 0

export function useToast(): ShowToast {
  return useContext(ToastCtx)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([])

  const show = useCallback<ShowToast>((text, kind = 'success') => {
    const id = ++toastSeq
    setItems((s) => [...s, { id, text, kind }])
    window.setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3200)
  }, [])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-hairline/10 bg-bg/90 py-2 pl-3 pr-4 shadow-pop backdrop-blur-xl"
            >
              {t.kind === 'success' ? (
                <CheckCircle2 size={15} className="text-accent" />
              ) : (
                <AlertCircle size={15} className="text-red-400" />
              )}
              <span className="text-[13px] font-medium">{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- Peças reutilizáveis ---------- */

/** Exclusão em dois cliques: o primeiro "arma" o botão por ~3 segundos. */
export function ConfirmButton({
  onConfirm,
  className,
  ariaLabel = 'Excluir',
}: {
  onConfirm: () => void
  className?: string
  ariaLabel?: string
}) {
  const [armed, setArmed] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return armed ? (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        window.clearTimeout(timer.current)
        setArmed(false)
        onConfirm()
      }}
      className="rounded-lg bg-red-500/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-red-500 dark:text-red-400"
    >
      Excluir?
    </button>
  ) : (
    <button
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setArmed(true)
        timer.current = window.setTimeout(() => setArmed(false), 2800)
      }}
      className={cn('icon-btn size-8 hover:border-red-500/30 hover:text-red-400', className)}
    >
      <Trash2 size={14} />
    </button>
  )
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  action,
}: {
  icon?: typeof Inbox
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-hairline/15 px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-2xl border border-hairline/10 bg-surface/5 text-ink-3">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {hint ? <p className="mt-1 text-sm text-ink-2">{hint}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-3xl border border-hairline/10 bg-surface/5 dark:bg-surface/[0.04]',
        className,
      )}
    />
  )
}

export function TagPill({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color: tag.color, background: `${tag.color}1a`, border: `1px solid ${tag.color}44` }}
    >
      {tag.name}
    </span>
  )
}

export function DueBadge({ due }: { due: string }) {
  const hot = due <= todayStr()
  return (
    <span className={cn('pill', hot && 'border-accent/40 text-accent')}>
      <CalendarDays size={11} />
      {dueLabel(due)}
    </span>
  )
}

export function FilterTags({
  tags,
  active,
  onChange,
}: {
  tags: Tag[]
  active: string | null
  onChange: (id: string | null) => void
}) {
  return (
    <div className="scrollbar-none -mx-1 mb-5 flex items-center gap-2 overflow-x-auto px-1 pb-1">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
          active === null
            ? 'bg-accent text-accent-ink'
            : 'border border-hairline/15 text-ink-2 hover:text-ink',
        )}
      >
        todas
      </button>
      {tags.map((t) => {
        const on = active === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(on ? null : t.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
              !on && 'border-hairline/15 text-ink-2 hover:text-ink',
            )}
            style={on ? { color: t.color, background: `${t.color}1f`, borderColor: `${t.color}55` } : undefined}
          >
            <span className="size-2 rounded-full" style={{ background: t.color }} />
            {t.name}
          </button>
        )
      })}
    </div>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} className="icon-btn" aria-label="Alternar tema">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="grid place-items-center"
        >
          {theme === 'dark' ? (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          ) : (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
