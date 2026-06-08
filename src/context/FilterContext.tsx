'use client'
import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { Filtros, Loja } from '@/types/dashboard'
import { useData } from './DataContext'

const FILTROS_VAZIOS: Filtros = {
  diretorDivisional: '',
  diretorRegional: '',
  gerenteRegional: '',
  codigoLoja: '',
  cidade: '',
  uf: '',
  statusLoja: '',
  indicadorCritico: '',
  projetoOlimpo: '',
}

interface FilterCtx {
  filtros: Filtros
  setFiltro: (key: keyof Filtros, value: string) => void
  resetFiltros: () => void
  lojasFiltered: Loja[]
  opcoesUnicas: {
    diretoresDivisionais: string[]
    diretoresRegionais: string[]
    gerentesRegionais: string[]
    cidades: string[]
    ufs: string[]
  }
}

const Ctx = createContext<FilterCtx>({
  filtros: FILTROS_VAZIOS,
  setFiltro: () => {},
  resetFiltros: () => {},
  lojasFiltered: [],
  opcoesUnicas: { diretoresDivisionais: [], diretoresRegionais: [], gerentesRegionais: [], cidades: [], ufs: [] },
})

export function FilterProvider({ children }: { children: ReactNode }) {
  const { lojas } = useData()
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS)

  const setFiltro = (key: keyof Filtros, value: string) => {
    setFiltros(prev => {
      const next = { ...prev, [key]: value }
      // Cascata: ao mudar divisional → limpa regional/gerente
      if (key === 'diretorDivisional') { next.diretorRegional = ''; next.gerenteRegional = '' }
      if (key === 'diretorRegional') { next.gerenteRegional = '' }
      return next
    })
  }

  const resetFiltros = () => setFiltros(FILTROS_VAZIOS)

  const lojasFiltered = useMemo(() => {
    return lojas.filter(l => {
      if (filtros.diretorDivisional && l.diretorDivisional !== filtros.diretorDivisional) return false
      if (filtros.diretorRegional  && l.diretorRegional  !== filtros.diretorRegional)  return false
      if (filtros.gerenteRegional  && l.gerenteRegional  !== filtros.gerenteRegional)  return false
      if (filtros.codigoLoja && !l.nomeLoja.toLowerCase().includes(filtros.codigoLoja.toLowerCase()) &&
          !l.codigoLoja.includes(filtros.codigoLoja)) return false
      if (filtros.cidade && l.cidade !== filtros.cidade) return false
      if (filtros.uf     && l.uf     !== filtros.uf)     return false
      if (filtros.statusLoja && l.statusLoja !== filtros.statusLoja) return false
      if (filtros.projetoOlimpo === 'sim' && !l.projetoOlimpo) return false
      if (filtros.projetoOlimpo === 'nao' && l.projetoOlimpo)  return false
      return true
    })
  }, [lojas, filtros])

  const opcoesUnicas = useMemo(() => {
    const uniq = (arr: string[]) => [...new Set(arr.filter(Boolean))].sort()
    const src = filtros.diretorDivisional
      ? lojas.filter(l => l.diretorDivisional === filtros.diretorDivisional)
      : lojas
    const src2 = filtros.diretorRegional
      ? src.filter(l => l.diretorRegional === filtros.diretorRegional)
      : src
    return {
      diretoresDivisionais: uniq(lojas.map(l => l.diretorDivisional)),
      diretoresRegionais:   uniq(src.map(l => l.diretorRegional)),
      gerentesRegionais:    uniq(src2.map(l => l.gerenteRegional)),
      cidades: uniq(lojas.map(l => l.cidade)),
      ufs:     uniq(lojas.map(l => l.uf)),
    }
  }, [lojas, filtros.diretorDivisional, filtros.diretorRegional])

  return <Ctx.Provider value={{ filtros, setFiltro, resetFiltros, lojasFiltered, opcoesUnicas }}>{children}</Ctx.Provider>
}

export const useFilters = () => useContext(Ctx)
