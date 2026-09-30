import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/AuthContext'
import { ThemeProvider } from './hooks/useTheme'
import { ToastProvider, Logo } from './components/ui'
import RequireAuth from './components/RequireAuth'
import Shell from './components/Shell'
import { isSupabaseConfigured } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Media from './pages/Media'
import Tags from './pages/Tags'
import Share from './pages/Share'
import Settings from './pages/Settings'

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Área protegida: exige sessão e fornece os dados do usuário */}
              <Route element={<RequireAuth />}>
                <Route path="/share" element={<Share />} />
                <Route element={<Shell />}>
                  <Route index path="/" element={<Dashboard />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="media" element={<Media />} />
                  <Route path="tags" element={<Tags />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

/** Tela exibida quando o .env ainda não foi configurado — evita crash com tela branca. */
function SetupNotice() {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="card max-w-md p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-ink">
          <Logo size={24} />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold">Configuração necessária</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          A Arca precisa das credenciais do Supabase para subir. Faça o seguinte:
        </p>
        <ol className="mt-4 space-y-2.5 text-sm text-ink-2">
          <li>
            1. Crie um projeto gratuito em{' '}
            <span className="font-mono text-[13px] text-accent">supabase.com</span>
          </li>
          <li>
            2. Rode o arquivo <span className="font-mono text-[13px] text-accent">supabase/schema.sql</span> no
            SQL Editor do projeto
          </li>
          <li>
            3. Copie a URL e a <em>anon key</em> de <span className="font-mono text-[13px]">Settings → API</span>{' '}
            para um arquivo <span className="font-mono text-[13px] text-accent">.env</span> na raiz
          </li>
          <li>4. Reinicie o servidor de desenvolvimento</li>
        </ol>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-ink-3">
          VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY
        </p>
      </div>
    </div>
  )
}
