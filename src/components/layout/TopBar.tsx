'use client'
import { useState } from 'react'
import { RefreshCw, Clock, SlidersHorizontal, X, Menu, Sun, Moon } from 'lucide-react'
import GlobalFilters from '@/components/filters/GlobalFilters'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import { useTheme } from '@/context/ThemeContext'

interface Props {
  onMenuToggle: () => void
}

export default function TopBar({ onMenuToggle }: Props) {
  const [showFilters, setShowFilters] = useState(false)
  const { updatedAt, refresh, refreshing } = useData()
  const { filtros, lojasFiltered, resetFiltros } = useFilters()

  const activeCount = Object.values(filtros).filter(v => v !== '').length
  const { theme, toggle } = useTheme()

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="sticky top-0 z-20">
      {/* Barra principal */}
      <div className="relative border-b border-slate-200 dark:border-[hsl(215_28%_15%)] bg-white/90 dark:bg-[hsl(217_28%_7%/0.96)] backdrop-blur-xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-sm dark:shadow-none">

        {/* Esquerda */}
        <div className="relative flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {/* Hamburger — mobile */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Botão de filtros */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 ${
              showFilters || activeCount > 0
                ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {showFilters ? <X className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-cyan-600 text-white rounded-full flex items-center justify-center leading-none">
                {activeCount}
              </span>
            )}
          </button>

          {/* Chips de filtros ativos */}
          {activeCount > 0 && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                {activeCount} {activeCount === 1 ? 'filtro' : 'filtros'}
              </span>
              <button
                onClick={resetFiltros}
                className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Limpar
              </button>
            </div>
          )}

          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap pl-1 border-l border-slate-200">
            {lojasFiltered.length}{' '}
            <span className="text-slate-400 hidden sm:inline">lojas</span>
          </span>
        </div>

        {/* Direita */}
        <div className="relative flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Timestamp */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[hsl(215_18%_58%)] bg-slate-50 dark:bg-[hsl(217_25%_11%)] border border-slate-200 dark:border-[hsl(215_28%_17%)] rounded-lg px-2.5 py-1.5">
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span className="font-medium">{fmtDate(updatedAt)}</span>
          </div>

          {/* Toggle dark/light */}
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            className="relative p-1.5 rounded-lg border border-slate-200 dark:border-[hsl(215_28%_17%)] text-slate-400 dark:text-[hsl(215_18%_58%)] hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-[hsl(215_28%_24%)] hover:bg-slate-50 dark:hover:bg-[hsl(217_25%_13%)] transition-all duration-200 cursor-pointer overflow-hidden group"
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            <span className={`block transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'}`}>
              <Sun className="w-3.5 h-3.5" />
            </span>
            <span className={`block transition-all duration-300 ${theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'}`}>
              <Moon className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Botão refresh */}
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-[11px] px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all duration-200 disabled:opacity-50
              bg-cyan-600 border border-cyan-700 text-white
              hover:bg-cyan-700
              shadow-[0_2px_8px_-2px_hsl(192_91%_36%/0.35)]"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {/* Painel de filtros colapsável */}
      <div className={`transition-all duration-200 ease-in-out ${
        showFilters ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="border-b border-slate-200 dark:border-[hsl(215_28%_15%)] bg-white/95 dark:bg-[hsl(217_28%_8%/0.98)] backdrop-blur-xl px-4 sm:px-6 py-4">
          <GlobalFilters />
        </div>
      </div>
    </div>
  )
}
