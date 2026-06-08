'use client'
import { useFilters } from '@/context/FilterContext'
import { Search, X } from 'lucide-react'
import type { Filtros } from '@/types/dashboard'

export default function GlobalFilters() {
  const { filtros, setFiltro, resetFiltros, opcoesUnicas, lojasFiltered } = useFilters()

  const sel = (key: keyof Filtros, label: string, opts: string[], value: string) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <select
        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-w-[120px] cursor-pointer transition-colors hover:border-slate-300"
        value={value}
        onChange={e => setFiltro(key, e.target.value)}
      >
        <option value="">Todos</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const hasActiveFilters = Object.values(filtros).some(v => v !== '')

  return (
    <div className="flex flex-wrap items-end gap-2.5">
      {sel('diretorDivisional', 'Dir. Divisional', opcoesUnicas.diretoresDivisionais, filtros.diretorDivisional)}
      {sel('diretorRegional',   'Dir. Regional',   opcoesUnicas.diretoresRegionais,   filtros.diretorRegional)}
      {sel('gerenteRegional',   'Ger. Regional',   opcoesUnicas.gerentesRegionais,     filtros.gerenteRegional)}
      {sel('uf',    'UF',     opcoesUnicas.ufs,     filtros.uf)}
      {sel('cidade', 'Cidade', opcoesUnicas.cidades, filtros.cidade)}

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</label>
        <select
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer transition-colors hover:border-slate-300"
          value={filtros.statusLoja}
          onChange={e => setFiltro('statusLoja', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Saudável">Saudável</option>
          <option value="Atenção">Atenção</option>
          <option value="Crítica">Crítica</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Olimpo</label>
        <select
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer transition-colors hover:border-slate-300"
          value={filtros.projetoOlimpo}
          onChange={e => setFiltro('projetoOlimpo', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="sim">Olimpo</option>
          <option value="nao">Não Olimpo</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Busca</label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Loja ou código..."
            className="text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-36 transition-colors hover:border-slate-300"
            value={filtros.codigoLoja}
            onChange={e => setFiltro('codigoLoja', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-end gap-2 pb-0.5">
        {hasActiveFilters && (
          <button
            onClick={resetFiltros}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
        <span className="text-xs text-slate-400 font-medium">
          {lojasFiltered.length} <span className="text-slate-300">lojas</span>
        </span>
      </div>
    </div>
  )
}
