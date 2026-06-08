'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Loja } from '@/types/dashboard'

interface DataCtx {
  lojas: Loja[]
  loading: boolean
  error: string | null
  updatedAt: string | null
  refresh: () => void
}

const Ctx = createContext<DataCtx>({ lojas: [], loading: true, error: null, updatedAt: null, refresh: () => {} })

export function DataProvider({ children }: { children: ReactNode }) {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    // Em produção (GitHub Pages) usa data.json gerado no build; em dev usa a API route
    const url = process.env.NODE_ENV === 'production' ? '/dashboard-performance/data.json' : '/api/sheets'
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setLojas(data.lojas)
        setUpdatedAt(data.updatedAt)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return <Ctx.Provider value={{ lojas, loading, error, updatedAt, refresh: load }}>{children}</Ctx.Provider>
}

export const useData = () => useContext(Ctx)
