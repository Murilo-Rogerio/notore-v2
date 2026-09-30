import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { authErrorMessage } from '../lib/utils'
import { Button, Input, Logo, Page } from '../components/ui'

export default function Reset() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (session) setHasSession(true)
      setChecking(false)
    })
    supabase!.auth.getSession().then(({ data }) => {
      if (data.session) setHasSession(true)
      setChecking(false)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('A nova senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não conferem.')
      return
    }
    setLoading(true)
    const { error } = await supabase!.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(authErrorMessage(error))
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <Page className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-ink">
            <Logo size={20} />
          </span>
          <span>
            <span className="block font-display font-semibold leading-none">Arca</span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              nova senha
            </span>
          </span>
        </div>

        {checking ? (
          <p className="text-sm text-ink-2">Verificando o link…</p>
        ) : !hasSession ? (
          <div className="card p-6">
            <h1 className="font-display text-lg font-semibold">Link expirado</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              O link de recuperação já foi usado ou perdeu a validade. Peça um novo na tela de login.
            </p>
            <Link to="/login" className="mt-4 inline-block text-[13px] font-medium text-accent">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4 p-6">
            <div>
              <h1 className="font-display text-lg font-semibold">Criar nova senha</h1>
              <p className="mt-1 text-sm text-ink-2">Defina a nova senha da sua conta.</p>
            </div>
            <Input
              label="Nova senha"
              type="password"
              placeholder="mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              placeholder="repita a senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-500 dark:text-red-400"
              >
                {error}
              </div>
            ) : null}
            <Button type="submit" className="w-full" loading={loading}>
              Salvar nova senha
            </Button>
          </form>
        )}
      </div>
    </Page>
  )
}
