import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { extractUrl } from '../lib/metadata'
import type { MediaItem } from '../lib/types'
import { PENDING_SHARE_KEY } from '../lib/utils'
import MediaSaver from '../components/MediaSaver'
import { Button, Logo, Page, useToast } from '../components/ui'

/**
 * Rota que recebe o Web Share Target do sistema:
 * /share?url=...&title=...&text=...
 * Também funciona como tela de "salvamento rápido" a partir do dashboard.
 */
export default function Share() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    sessionStorage.removeItem(PENDING_SHARE_KEY)
  }, [])

  const initialUrl = params.get('url') || extractUrl(params.get('text')) || ''
  const initialTitle = params.get('title') || ''

  const [saved, setSaved] = useState<MediaItem | null>(null)
  const [round, setRound] = useState(0)

  return (
    <Page className="min-h-dvh px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-ink">
              <Logo size={17} />
            </span>
            <span className="font-display font-semibold">Arca</span>
          </Link>
          {params.toString() ? <span className="pill">via compartilhamento</span> : null}
        </div>

        {saved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="card p-8 text-center"
          >
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent">
              <CheckCircle2 size={26} />
            </div>
            <h1 className="mt-4 font-display text-xl font-semibold">Arquivado na sua coleção</h1>
            <p className="mt-1.5 line-clamp-2 text-sm text-ink-2">{saved.title ?? saved.url}</p>
            <div className="mt-6 flex justify-center gap-2.5">
              <Button
                variant="ghost"
                onClick={() => {
                  setSaved(null)
                  setRound((r) => r + 1)
                }}
              >
                Salvar outro
              </Button>
              <Button onClick={() => navigate('/media')}>
                Ver coleção <ArrowRight size={15} />
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="card p-5 sm:p-6">
            <h1 className="font-display text-lg font-semibold">Guardar na Arca</h1>
            <p className="mb-5 mt-1 text-sm text-ink-2">
              Confira o preview, escolha etiquetas e arquive o link.
            </p>
            <MediaSaver
              key={round}
              initialUrl={initialUrl}
              initialTitle={initialTitle}
              onSaved={(item) => {
                setSaved(item)
                toast('Link arquivado')
              }}
              onCancel={() => navigate('/')}
            />
          </div>
        )}
      </div>
    </Page>
  )
}
