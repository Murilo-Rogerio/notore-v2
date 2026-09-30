export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Chave do sessionStorage onde guardamos um compartilhamento que chegou sem sessão. */
export const PENDING_SHARE_KEY = 'arca_pending_share'

/** Data de hoje no formato local YYYY-MM-DD (mesmo formato do input[type=date]). */
export function todayStr(): string {
  return new Date().toLocaleDateString('sv')
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('sv')
}

export function formatDateShort(value: string): string {
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })
    .format(d)
    .replace('.', '')
}

export function longDate(): string {
  const s = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function dueLabel(due: string): string {
  const t = todayStr()
  if (due === t) return 'hoje'
  if (due === addDays(t, 1)) return 'amanhã'
  if (due === addDays(t, -1)) return 'ontem'
  return formatDateShort(due)
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `há ${d} d`
  return formatDateShort(iso)
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function firstName(name?: string | null, email?: string): string {
  const first = (name ?? '').trim().split(/\s+/)[0]
  if (first) return first
  return (email ?? 'você').split('@')[0]
}

export function initialOf(name?: string | null, email?: string): string {
  return firstName(name, email).charAt(0).toUpperCase() || 'A'
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Tradução dos erros mais comuns do Supabase Auth para mensagens humanas. */
export function authErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  const table: Array<[RegExp, string]> = [
    [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
    [/user already registered/i, 'Já existe uma conta com este e-mail.'],
    [/email not confirmed/i, 'Confirme seu e-mail antes de entrar — procure na caixa de entrada e no spam.'],
    [/password should be at least/i, 'A senha precisa ter pelo menos 6 caracteres.'],
    [/unable to validate email/i, 'Digite um e-mail válido.'],
    [/failed to fetch|networkerror|fetch failed/i, 'Não foi possível falar com o Supabase. Confira sua conexão e as variáveis do .env.'],
    [/redirect_uri_mismatch/i, 'O redirect do Google não confere — revise o passo a passo do OAuth no README.'],
  ]
  for (const [re, message] of table) if (re.test(msg)) return message
  return 'Algo deu errado. Tente novamente em instantes.'
}
