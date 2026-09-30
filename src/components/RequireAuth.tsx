import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { DataProvider } from '../store/DataContext'
import { Logo } from './ui'
import { PENDING_SHARE_KEY } from '../lib/utils'

/**
 * Guarda de rota: se um compartilhamento chegar sem sessão, o payload é
 * guardado no sessionStorage e retomado automaticamente após o login
 * (inclusive no fluxo OAuth do Google, que volta para a raiz do app).
 */
export default function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="animate-pulse text-accent">
          <Logo size={40} />
        </div>
      </div>
    )
  }

  if (!session) {
    if (location.pathname === '/share') {
      sessionStorage.setItem(PENDING_SHARE_KEY, location.search)
    }
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const pending = sessionStorage.getItem(PENDING_SHARE_KEY)
  if (pending !== null && location.pathname !== '/share') {
    return <Navigate to={`/share${pending}`} replace />
  }

  return (
    <DataProvider>
      <Outlet />
    </DataProvider>
  )
}
