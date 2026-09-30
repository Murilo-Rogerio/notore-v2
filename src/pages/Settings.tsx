import { LogOut, Smartphone } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useAuth } from '../hooks/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { Button, Page, useToast } from '../components/ui'

export default function Settings() {
  const { session, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { canInstall, promptInstall } = useInstallPrompt()
  const toast = useToast()

  return (
    <Page>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight">Ajustes</h1>

      <div className="max-w-2xl space-y-4">
        <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-display font-semibold">Aparência</h2>
            <p className="mt-1 text-sm text-ink-2">Escolha entre o modo escuro e o claro.</p>
          </div>
          <div className="flex gap-1 rounded-xl border border-hairline/10 bg-surface/5 p-1">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={
                  theme === t
                    ? 'rounded-lg bg-surface/80 px-3 py-1.5 text-[13px] font-medium text-ink shadow-card dark:bg-surface/[0.1]'
                    : 'rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-2 transition hover:text-ink'
                }
              >
                {t === 'dark' ? 'Escuro' : 'Claro'}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-display font-semibold">
                <Smartphone size={16} className="text-accent" /> Instalar o app
              </h2>
              <p className="mt-1 max-w-sm text-sm text-ink-2">
                Adicione a Arca à tela inicial e compartilhe links direto do TikTok, YouTube ou
                Instagram para cá.
              </p>
            </div>
            {canInstall ? (
              <Button
                onClick={async () => {
                  const outcome = await promptInstall()
                  if (outcome === 'accepted') toast('App instalado')
                }}
              >
                Instalar agora
              </Button>
            ) : null}
          </div>
          {!canInstall ? (
            <p className="mt-4 rounded-xl border border-hairline/10 bg-surface/5 p-3 font-mono text-[11px] leading-relaxed text-ink-3">
              android · chrome: menu (⋮) → “instalar app”
              <br />
              iphone · safari: compartilhar → “adicionar à tela de início”
            </p>
          ) : null}
        </section>

        <section className="card flex flex-wrap items-center gap-4 p-5">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent/15 font-display text-lg font-semibold text-accent">
            {(profile?.display_name ?? session?.user?.email ?? 'A').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile?.display_name ?? 'Sua conta'}</p>
            <p className="truncate text-sm text-ink-3">{session?.user?.email}</p>
          </div>
          <Button variant="danger" onClick={() => signOut()}>
            <LogOut size={14} /> Sair
          </Button>
        </section>

        <section className="card p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
            Arca · v1.0.0 · notas + listas + links
          </p>
          <p className="mt-2 text-sm text-ink-2">
            Funciona offline depois do primeiro acesso. Seus dados vivem no seu projeto Supabase.
          </p>
        </section>
      </div>
    </Page>
  )
}
