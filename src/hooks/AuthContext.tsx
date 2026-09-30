import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'
import { authErrorMessage } from '../lib/utils'

type AuthResult = { error: string | null; needsConfirmation?: boolean }

type AuthCtx = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Sessão persistida + listener de mudanças (login, logout, refresh de token)
  useEffect(() => {
    supabase!.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase!.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null
  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return
    }
    let alive = true
    supabase!
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setProfile((data as Profile) ?? null)
      })
    return () => {
      alive = false
    }
  }, [userId])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
    if (error) return { error: authErrorMessage(error) }
    if (data.session) setSession(data.session) // evita corrida com o listener
    return { error: null }
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) return { error: authErrorMessage(error) }
      if (data.session) setSession(data.session)
      // Sem sessão = projeto com "Confirm e-mail" ativado
      return { error: null, needsConfirmation: !data.session }
    },
    [],
  )

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase!.auth.signOut()
    setSession(null)
    setProfile(null)
  }, [])

  return (
    <Ctx.Provider value={{ session, profile, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
