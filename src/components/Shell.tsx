import { Bookmark, Home, LogOut, NotebookPen, Settings, Tags } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { cn, firstName, initialOf } from '../lib/utils'
import { Logo, ThemeToggle } from './ui'

const NAV = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/notes', label: 'Notas', icon: NotebookPen },
  { to: '/media', label: 'Mídias', icon: Bookmark },
  { to: '/tags', label: 'Etiquetas', icon: Tags },
  { to: '/settings', label: 'Ajustes', icon: Settings },
]

export default function Shell() {
  return (
    <div className="min-h-dvh md:pl-[248px]">
      <Sidebar />
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-10 md:pb-14 md:pt-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function Sidebar() {
  const { session, profile, signOut } = useAuth()
  const name = firstName(profile?.display_name, session?.user?.email)
  const email = session?.user?.email ?? ''

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-hairline/10 bg-surface/40 px-4 py-6 backdrop-blur-xl dark:bg-surface/[0.02] md:flex">
      <Link to="/" className="flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-ink">
          <Logo size={20} />
        </span>
        <span>
          <span className="block font-display font-semibold leading-none">Arca</span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
            guardar & organizar
          </span>
        </span>
      </Link>

      <nav className="mt-8 flex-1 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'border-hairline/10 bg-surface/70 text-ink dark:bg-surface/[0.07]'
                  : 'border-transparent text-ink-2 hover:bg-surface/40 hover:text-ink dark:hover:bg-surface/[0.04]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={17} className={isActive ? 'text-accent' : ''} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-hairline/10 pt-5">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 font-display text-sm font-semibold text-accent">
            {initialOf(profile?.display_name, email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block truncate text-xs text-ink-3">{email}</span>
          </span>
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-hairline/15 px-3 py-2 text-[13px] font-medium text-ink-2 transition hover:border-hairline/30 hover:text-ink"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
    </aside>
  )
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-hairline/10 bg-bg/80 px-4 backdrop-blur-xl md:hidden">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-xl bg-accent text-accent-ink">
          <Logo size={16} />
        </span>
        <span className="font-display font-semibold">Arca</span>
      </Link>
      <ThemeToggle />
    </header>
  )
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline/10 bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2.5 transition',
                isActive ? 'text-accent' : 'text-ink-3',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
