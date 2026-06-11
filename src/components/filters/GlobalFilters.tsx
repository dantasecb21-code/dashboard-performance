'use client'
import { useFilters } from '@/context/FilterContext'
import { Search } from 'lucide-react'
import GlassSelect from '@/components/common/GlassSelect'
import type { Filtros } from '@/types/dashboard'

export default function GlobalFilters() {
  const { filtros, setFiltro, opcoesUnicas } = useFilters()

  const toOpts = (arr: string[]) => arr.map(v => ({ value: v, label: v }))

  return (
    <div className="flex flex-wrap items-end gap-2 sm:gap-2.5">
      <GlassSelect
        label="Dir. Divisional"
        value={filtros.diretorDivisional}
        options={toOpts(opcoesUnicas.diretoresDivisionais)}
        onChange={v => setFiltro('diretorDivisional', v)}
        className="min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none"
      />
      <GlassSelect
        label="Dir. Regional"
        value={filtros.diretorRegional}
        options={toOpts(opcoesUnicas.diretoresRegionais)}
        onChange={v => setFiltro('diretorRegional', v)}
        className="min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none"
      />
      <GlassSelect
        label="Ger. Regional"
        value={filtros.gerenteRegional}
        options={toOpts(opcoesUnicas.gerentesRegionais)}
        onChange={v => setFiltro('gerenteRegional', v)}
        className="min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none"
      />
      <GlassSelect
        label="UF"
        value={filtros.uf}
        options={toOpts(opcoesUnicas.ufs)}
        onChange={v => setFiltro('uf', v)}
        className="min-w-[80px] sm:min-w-[90px] flex-1 sm:flex-none"
      />
      <GlassSelect
        label="Cidade"
        value={filtros.cidade}
        options={toOpts(opcoesUnicas.cidades)}
        onChange={v => setFiltro('cidade', v)}
        className="min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none"
      />
      <GlassSelect
        label="Status"
        value={filtros.statusLoja}
        options={[
          { value: 'Saudável', label: 'Saudável' },
          { value: 'Atenção', label: 'Atenção' },
          { value: 'Crítica', label: 'Crítica' },
        ]}
        onChange={v => setFiltro('statusLoja', v)}
        className="min-w-[100px] sm:min-w-[110px] flex-1 sm:flex-none"
      />
      <GlassSelect
        label="Olimpo"
        value={filtros.projetoOlimpo}
        options={[
          { value: 'sim', label: 'Olimpo' },
          { value: 'nao', label: 'Não Olimpo' },
        ]}
        onChange={v => setFiltro('projetoOlimpo', v)}
        className="min-w-[100px] sm:min-w-[110px] flex-1 sm:flex-none"
      />

      <div className="flex flex-col gap-1 flex-1 sm:flex-none">
        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">Busca</label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Loja ou código..."
            className="text-xs border border-slate-200 dark:border-[hsl(215_28%_17%)] rounded-lg pl-6 pr-2.5 py-1.5 bg-white dark:bg-[hsl(217_25%_11%)] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900/40 focus:border-cyan-300 dark:focus:border-cyan-800 w-full sm:w-40 transition-colors hover:border-slate-300 dark:hover:border-[hsl(215_28%_22%)]"
            value={filtros.codigoLoja}
            onChange={e => setFiltro('codigoLoja', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
