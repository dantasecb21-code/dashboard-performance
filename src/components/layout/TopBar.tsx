'use client'
import { useState } from 'react'
import { RefreshCw, Clock, SlidersHorizontal, X, Menu } from 'lucide-react'
import GlobalFilters from '@/components/filters/GlobalFilters'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'

interface Props {
  onMenuToggle: () => void
}

export default function TopBar({ onMenuToggle }: Props) {
  const [showFilters, setShowFilters] = useState(false)
  const { updatedAt, refresh, loading } = useData()
  const { filtros, lojasFiltered, resetFiltros } = useFilters()

  const activeCount = Object.values(filtros).filter(v => v !== '').length

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="sticky top-0 z-20">
      {/* Barra principal */}
      <div className="relative border-b border-white/[0.08] backdrop-blur-2xl bg-background/60 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Gradiente sutil no fundo do header */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.05] via-transparent to-accent/[0.04] pointer-events-none" />

        {/* Esquerda */}
        <div className="relative flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Hamburger — só mobile */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Toggle de filtros */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 ${
              showFilters || activeCount > 0
                ? 'bg-primary/15 border-primary/40 text-primary'
                : 'bg-white/[0.05] border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground'
            }`}
          >
            {showFilters ? <X className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-primary text-white rounded-full flex items-center justify-center leading-none">
                {activeCount}
              </span>
            )}
          </button>

          {/* Chips de filtros ativos */}
          {activeCount > 0 && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                {activeCount} {activeCount === 1 ? 'filtro' : 'filtros'}
              </span>
              <button
                onClick={resetFiltros}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer whitespace-nowrap"
              >
                Limpar
              </button>
            </div>
          )}

          <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
            {lojasFiltered.length} <span className="text-muted-foreground/50 hidden sm:inline">lojas</span>
          </span>
        </div>

        {/* Direita: data + refresh */}
        <div className="relative flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5">
            <Clock className="w-3 h-3" />
            <span className="font-medium">{fmtDate(updatedAt)}</span>
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] px-2.5 sm:px-3 py-1.5 rounded-lg
              bg-gradient-to-r from-primary/80 to-accent/70
              border border-white/15 text-white
              hover:from-primary hover:to-accent
              disabled:opacity-50 transition-all duration-200 font-semibold cursor-pointer
              shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.4)]"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Painel de filtros colapsável */}
      <div className={`transition-all duration-200 ease-in-out ${
        showFilters ? 'max-h-[440px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="border-b border-white/[0.08] backdrop-blur-2xl bg-background/70 px-4 sm:px-6 py-4">
          <GlobalFilters />
        </div>
      </div>
    </div>
  )
}
