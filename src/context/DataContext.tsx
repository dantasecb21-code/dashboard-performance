'use client'
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { Loja } from '@/types/dashboard'

interface DataCtx {
  lojas: Loja[]
  loading: boolean
  refreshing: boolean
  error: string | null
  updatedAt: string | null
  refresh: () => void
}

const Ctx = createContext<DataCtx>({
  lojas: [], loading: true, refreshing: false, error: null, updatedAt: null, refresh: () => {},
})

export function DataProvider({ children }: { children: ReactNode }) {
  const [lojas, setLojas]       = useState<Loja[]>([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const hasData = useRef(false)

  const load = useCallback(async () => {
    // Carga inicial → mostra LoadingSpinner nas páginas
    // Re-fetch → só anima o botão, mantém dados visíveis
    if (!hasData.current) setLoading(true)
    else setRefreshing(true)
    setError(null)

    try {
      if (process.env.NODE_ENV === 'production') {
        // Dispara atualização no servidor e aguarda conclusão
        await fetch('/api/refresh', { method: 'POST' })
        // Busca o arquivo atualizado (cache-bust)
        const data = await fetch('/data.json?t=' + Date.now()).then(r => r.json())
        if (data.error) throw new Error(data.error)
        hasData.current = true
        setLojas(data.lojas)
        setUpdatedAt(data.updatedAt)
      } else {
        const data = await fetch('/api/sheets').then(r => r.json())
        if (data.error) throw new Error(data.error)
        hasData.current = true
        setLojas(data.lojas)
        setUpdatedAt(data.updatedAt)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Carga inicial
  useEffect(() => { load() }, [load])

  // Auto-refresh silencioso a cada 15 min — só re-busca o arquivo (cron mantém atualizado)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    const id = setInterval(async () => {
      try {
        const data = await fetch('/data.json?t=' + Date.now()).then(r => r.json())
        if (data?.lojas?.length) {
          setLojas(data.lojas)
          setUpdatedAt(data.updatedAt)
        }
      } catch (_) {}
    }, 15 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <Ctx.Provider value={{ lojas, loading, refreshing, error, updatedAt, refresh: load }}>
      {children}
    </Ctx.Provider>
  )
}

export const useData = () => useContext(Ctx)
