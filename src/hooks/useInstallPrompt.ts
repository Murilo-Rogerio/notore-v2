import { useEffect, useState } from 'react'

type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice?: Promise<{ outcome: string }>
}

/** Captura o beforeinstallprompt para oferecer instalação in-app (Android/Chrome). */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as InstallEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | null> => {
    if (!deferred) return null
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    return (choice?.outcome as 'accepted' | 'dismissed') ?? null
  }

  return { canInstall: deferred !== null, promptInstall }
}
