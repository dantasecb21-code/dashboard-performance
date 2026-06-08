'use client'
import { RefreshCw, Clock } from 'lucide-react'
import GlobalFilters from '@/components/filters/GlobalFilters'
import { useData } from '@/context/DataContext'

export default function TopBar() {
  const { updatedAt, refresh, loading } = useData()

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex flex-wrap items-center gap-4 justify-between sticky top-0 z-10 shadow-sm">
      <GlobalFilters />

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
          <Clock className="w-3 h-3" />
          <span className="font-medium">{fmtDate(updatedAt)}</span>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-all duration-150 font-semibold cursor-pointer focus-visible:outline-brand-500 shadow-sm"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>
    </div>
  )
}
