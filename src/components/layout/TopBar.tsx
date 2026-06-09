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
      <div className="relative border-b border-[hsl(220_40%_10%)] backdrop-blur-2xl bg-[hsl(222_58%_3.5%/0.75)] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Shimmer sutil no fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(177_100%_41%/0.04)] via-transparent to-[hsl(220_52%_20%/0.03)] pointer-events-none" />

        {/* Esquerda */}
        <div className="relative flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {/* Hamburger — mobile */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-[hsl(218_18%_45%)] hover:bg-white/[0.05] hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Botão de filtros */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 ${
              showFilters || activeCount > 0
                ? 'bg-[hsl(177_100%_41%/0.12)] border-[hsl(177_100%_41%/0.35)] text-[hsl(177_100%_55%)]'
                : 'bg-white/[0.04] border-[hsl(220_40%_16%)] text-[hsl(218_18%_48%)] hover:border-[hsl(220_40%_22%)] hover:text-foreground'
            }`}
          >
            {showFilters ? <X className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-[hsl(177_100%_41%)] text-[hsl(222_58%_4%)] rounded-full flex items-center justify-center leading-none">
                {activeCount}
              </span>
            )}
          </button>

          {/* Chips de filtros ativos */}
          {activeCount > 0 && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-[hsl(177_100%_55%)] bg-[hsl(177_100%_41%/0.1)] border border-[hsl(177_100%_41%/0.22)] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                {activeCount} {activeCount === 1 ? 'filtro' : 'filtros'}
              </span>
              <button
                onClick={resetFiltros}
                className="text-[11px] text-[hsl(218_18%_45%)] hover:text-foreground transition-colors cursor-pointer whitespace-nowrap"
              >
                Limpar
              </button>
            </div>
          )}

          <span className="text-[11px] text-[hsl(218_18%_40%)] font-medium whitespace-nowrap pl-1 border-l border-[hsl(220_40%_14%)]">
            {lojasFiltered.length}{' '}
            <span className="text-[hsl(218_18%_32%)] hidden sm:inline">lojas</span>
          </span>
        </div>

        {/* Direita */}
        <div className="relative flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Timestamp */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[hsl(218_18%_40%)] bg-white/[0.03] border border-[hsl(220_40%_14%)] rounded-lg px-2.5 py-1.5">
            <Clock className="w-3 h-3 text-[hsl(218_18%_35%)]" />
            <span className="font-medium">{fmtDate(updatedAt)}</span>
          </div>

          {/* Botão refresh */}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all duration-200 disabled:opacity-50
              bg-[hsl(177_100%_41%/0.12)] border border-[hsl(177_100%_41%/0.3)] text-[hsl(177_100%_60%)]
              hover:bg-[hsl(177_100%_41%/0.2)] hover:border-[hsl(177_100%_41%/0.5)]
              shadow-[0_0_14px_-4px_hsl(177_100%_41%/0.25)]"
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
        <div className="border-b border-[hsl(220_40%_10%)] backdrop-blur-2xl bg-[hsl(222_58%_3.5%/0.85)] px-4 sm:px-6 py-4">
          <GlobalFilters />
        </div>
      </div>
    </div>
  )
}
