export type LinkProvider = 'youtube' | 'tiktok' | 'instagram' | 'link'

export type LinkMeta = {
  url: string
  provider: LinkProvider
  title: string | null
  author: string | null
  thumbnail: string | null
}

export function normalizeUrl(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`
  try {
    const u = new URL(withProto)
    if (!u.hostname.includes('.')) return null
    return u.toString()
  } catch {
    return null
  }
}

export function extractUrl(text: string | null): string | null {
  if (!text) return null
  const m = text.match(/https?:\/\/[^\s<>"']+/i)
  return m ? m[0] : null
}

export function detectProvider(url: string): LinkProvider {
  let host: string
  try {
    host = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'link'
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be' || host === 'music.youtube.com') return 'youtube'
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok'
  if (host === 'instagram.com' || host.endsWith('.instagram.com') || host === 'instagr.am') return 'instagram'
  return 'link'
}

async function fetchJson(url: string, timeoutMs = 7000): Promise<Record<string, unknown>> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(String(res.status))
    return (await res.json()) as Record<string, unknown>
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchLinkMeta(url: string, fallbackTitle?: string | null): Promise<LinkMeta> {
  const provider = detectProvider(url)
  const meta: LinkMeta = {
    url,
    provider,
    title: fallbackTitle?.trim() || null,
    author: null,
    thumbnail: null,
  }
  try {
    if (provider === 'youtube') {
      const d = await fetchJson(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`)
      return {
        ...meta,
        title: (d.title as string) ?? meta.title,
        author: (d.author_name as string) ?? null,
        thumbnail: (d.thumbnail_url as string) ?? null,
      }
    }
    if (provider === 'tiktok') {
      const d = await fetchJson(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
      return {
        ...meta,
        title: (d.title as string) ?? meta.title,
        author: (d.author_name as string) ?? null,
        thumbnail: (d.thumbnail_url as string) ?? null,
      }
    }
  } catch {
    // offline, timeout ou bloqueio — segue com o fallback
  }
  return meta
}
