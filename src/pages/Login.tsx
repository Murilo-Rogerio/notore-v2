import { motion } from 'framer-motion'
import { Bookmark, ListTodo, Smartphone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { authErrorMessage } from '../lib/utils'
import { Button, GoogleIcon, Input, Logo } from '../components/ui'
import { supabase } from '../lib/supabase'

type Mode = 'signin' | 'signup'

export default function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!email.includes('@')) return setError('Digite um e-mail válido.')
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    if (mode === 'signup' && !name.trim()) return setError('Digite seu nome.')

    setLoading(true)
    const result =
      mode === 'signin' ? await signIn(email, password) : await signUp(name, email, password)
    setLoading(false)

    if (result.error) return setError(result.error)
    if (result.needsConfirmation) {
      return setNotice(`Enviamos um link de confirmação para ${email}. Depois de confirmar, volte e entre.`)
    }
    navigate(from, { replace: true }) // o guard retoma um share pendente, se houver
  }

  const google = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError(authErrorMessage(e))
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Painel editorial (desktop) */}
      <aside className="relative hidden flex-col justify-between border-r border-hairline/10 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-ink">
            <Logo size={20} />
          </span>
          <span>
            <span className="block font-display font-semibold leading-none">Arca</span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              guardar & organizar
            </span>
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight">
            Um cantinho para tudo o que você quer <span className="text-accent">guardar</span>.
          </h1>
          <p className="mt-5 leading-relaxed text-ink-2">
            Links do TikTok e YouTube, notas rápidas, listas e sua rotina — tudo em um só lugar,
            direto na tela inicial do seu celular.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Bookmark, text: 'Salve vídeos e posts com preview automático' },
              { icon: ListTodo, text: 'Listas de tarefas e rotina do dia em cartões' },
              { icon: Smartphone, text: 'Instala como app nativo e funciona offline' },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-hairline/10 bg-surface/5 text-ink-2">
                  <f.icon size={17} />
                </span>
                <span className="text-sm text-ink-2">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
          Arca · notas + listas + links
        </p>
      </aside>

      {/* Formulário */}
      <section className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-ink">
              <Logo size={20} />
            </span>
            <span className="font-display text-lg font-semibold">Arca</span>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-hairline/10 bg-surface/5 p-1">
            {(
              [
                { m: 'signin' as Mode, label: 'Entrar' },
                { m: 'signup' as Mode, label: 'Criar conta' },
              ]
            ).map((tab) => (
              <button
                key={tab.m}
                onClick={() => {
                  setMode(tab.m)
                  setError(null)
                  setNotice(null)
                }}
                aria-pressed={mode === tab.m}
                className={
                  mode === tab.m
                    ? 'rounded-xl bg-surface/80 py-2 text-sm font-medium text-ink shadow-card dark:bg-surface/[0.1]'
                    : 'rounded-xl py-2 text-sm font-medium text-ink-2 transition hover:text-ink'
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' ? (
              <Input
                label="Nome"
                placeholder="Como podemos te chamar?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            ) : null}
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-500 dark:text-red-400"
              >
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="rounded-xl border border-accent/25 bg-accent/10 px-3.5 py-2.5 text-[13px] text-ink">
                {notice}
              </div>
            ) : null}

            <Button type="submit" className="w-full" loading={loading}>
              {mode === 'signin' ? 'Entrar' : 'Criar minha conta'}
            </Button>
          </form>

                    {mode === 'signin' && (
            <button
              type="button"
              className="mt-3 text-[13px] font-medium text-ink-2 underline-offset-4 transition hover:text-accent hover:underline"
              onClick={async () => {
                setError(null)
                setNotice(null)
                if (!email.includes('@')) {
                  setError('Digite seu e-mail no campo acima e clique aqui de novo.')
                  return
                }
                const { error } = await supabase!.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset`,
                })
                if (error) setError(authErrorMessage(error))
                else setNotice(`Enviamos um link de recuperação para ${email}. Abra o e-mail e toque no link.`)
              }}
            >
              Esqueci minha senha
            </button>
          )}
          
          <div className="my-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            <span className="h-px flex-1 bg-hairline/15" /> ou <span className="h-px flex-1 bg-hairline/15" />
          </div>

          <Button variant="ghost" className="w-full" onClick={google}>
            <GoogleIcon /> Continuar com o Google
          </Button>

          <p className="mt-6 text-center text-[13px] text-ink-2">
            {mode === 'signin' ? (
              <>
                Não tem conta?{' '}
                <button className="font-medium text-accent" onClick={() => setMode('signup')}>
                  Criar agora
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button className="font-medium text-accent" onClick={() => setMode('signin')}>
                  Entrar
                </button>
              </>
            )}
          </p>
        </motion.div>
      </section>
    </div>
  )
}
