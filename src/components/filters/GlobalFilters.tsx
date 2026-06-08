'use client'
import { useFilters } from '@/context/FilterContext'
import type { Filtros } from '@/types/dashboard'

export default function GlobalFilters() {
  const { filtros, setFiltro, resetFiltros, opcoesUnicas, lojasFiltered } = useFilters()

  const sel = (key: keyof Filtros, label: string, opts: string[], value: string) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      <select
        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[130px]"
        value={value}
        onChange={e => setFiltro(key, e.target.value)}
      >
        <option value="">Todos</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div className="flex flex-wrap items-end gap-3">
      {sel('diretorDivisional', 'Dir. Divisional', opcoesUnicas.diretoresDivisionais, filtros.diretorDivisional)}
      {sel('diretorRegional',   'Dir. Regional',   opcoesUnicas.diretoresRegionais,   filtros.diretorRegional)}
      {sel('gerenteRegional',   'Ger. Regional',   opcoesUnicas.gerentesRegionais,     filtros.gerenteRegional)}
      {sel('uf',    'UF',     opcoesUnicas.ufs,     filtros.uf)}
      {sel('cidade', 'Cidade', opcoesUnicas.cidades, filtros.cidade)}

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</label>
        <select className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={filtros.statusLoja} onChange={e => setFiltro('statusLoja', e.target.value)}>
          <option value="">Todos</option>
          <option value="Saudável">Saudável</option>
          <option value="Atenção">Atenção</option>
          <option value="Crítica">Crítica</option>
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Olimpo</label>
        <select className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={filtros.projetoOlimpo} onChange={e => setFiltro('projetoOlimpo', e.target.value)}>
          <option value="">Todos</option>
          <option value="sim">Olimpo</option>
          <option value="nao">Não Olimpo</option>
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Busca</label>
        <input
          type="text"
          placeholder="Loja ou código..."
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 w-36"
          value={filtros.codigoLoja}
          onChange={e => setFiltro('codigoLoja', e.target.value)}
        />
      </div>

      <div className="flex items-end gap-2">
        <button onClick={resetFiltros}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
          Limpar
        </button>
        <span className="text-xs text-gray-400 pb-1">{lojasFiltered.length} lojas</span>
      </div>
    </div>
  )
}
