'use client'
import { useFilters } from '@/context/FilterContext'
import { Search } from 'lucide-react'
import type { Filtros } from '@/types/dashboard'

const SELECT_CLS =
  'text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer transition-colors hover:border-slate-300 w-full min-w-0'

export default function GlobalFilters() {
  const { filtros, setFiltro, opcoesUnicas } = useFilters()

  const sel = (key: keyof Filtros, label: string, opts: string[], value: string) => (
    <div className="flex flex-col gap-1 min-w-[100px] sm:min-w-[120px] flex-1 sm:flex-none">
      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <select className={SELECT_CLS} value={value} onChange={e => setFiltro(key, e.target.value)}>
        <option value="">Todos</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div className="flex flex-wrap items-end gap-2 sm:gap-3">
      {sel('diretorDivisional', 'Dir. Divisional', opcoesUnicas.diretoresDivisionais, filtros.diretorDivisional)}
      {sel('diretorRegional',   'Dir. Regional',   opcoesUnicas.diretoresRegionais,   filtros.diretorRegional)}
      {sel('gerenteRegional',   'Ger. Regional',   opcoesUnicas.gerentesRegionais,    filtros.gerenteRegional)}
      {sel('uf',    'UF',     opcoesUnicas.ufs,     filtros.uf)}
      {sel('cidade', 'Cidade', opcoesUnicas.cidades, filtros.cidade)}

      <div className="flex flex-col gap-1 min-w-[90px] sm:min-w-[100px] flex-1 sm:flex-none">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
        <select className={SELECT_CLS} value={filtros.statusLoja} onChange={e => setFiltro('statusLoja', e.target.value)}>
          <option value="">Todos</option>
          <option value="Saudável">Saudável</option>
          <option value="Atenção">Atenção</option>
          <option value="Crítica">Crítica</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 min-w-[90px] sm:min-w-[100px] flex-1 sm:flex-none">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Olimpo</label>
        <select className={SELECT_CLS} value={filtros.projetoOlimpo} onChange={e => setFiltro('projetoOlimpo', e.target.value)}>
          <option value="">Todos</option>
          <option value="sim">Olimpo</option>
          <option value="nao">Não Olimpo</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Busca</label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Loja ou código..."
            className="text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-40 transition-colors hover:border-slate-300"
            value={filtros.codigoLoja}
            onChange={e => setFiltro('codigoLoja', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
