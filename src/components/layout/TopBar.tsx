'use client'
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
    <div className="bg-white border-b border-gray-100 px-6 py-3 flex flex-wrap items-end gap-4 justify-between">
      <GlobalFilters />
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-gray-400">Atualizado: {fmtDate(updatedAt)}</span>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition">
          {loading ? '⏳' : '🔄'} Atualizar
        </button>
      </div>
    </div>
  )
}
