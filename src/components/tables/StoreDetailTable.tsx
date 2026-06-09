'use client'
import { useState, useMemo } from 'react'
import clsx from 'clsx'
import type { Loja } from '@/types/dashboard'
import { fmtBRL, fmtPct } from '@/lib/formatters'
import StatusBadge from '@/components/common/StatusBadge'
import { statusIndicador } from '@/lib/statusRules'

type SortKey = keyof Loja
type SortDir = 'asc' | 'desc'

const CELL_INDICADOR = (val: number | null, ind: Parameters<typeof statusIndicador>[0], cls?: string) => {
  const cor = statusIndicador(ind, val)
  const colorCls = {
    verde: 'text-green-700', amarelo: 'text-yellow-700', vermelho: 'text-destructive', neutro: 'text-gray-400'
  }[cor]
  return <td className={clsx('px-3 py-2 text-right text-xs font-medium', colorCls, cls)}>{val !== null ? fmtPct(val) : '—'}</td>
}

const PAGE_SIZE = 25

interface Props { lojas: Loja[] }

export default function StoreDetailTable({ lojas }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('scoreSaude')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  const searched = useMemo(() =>
    search ? lojas.filter(l => l.nomeLoja.toLowerCase().includes(search.toLowerCase()) || l.codigoLoja.includes(search))
           : lojas, [lojas, search])

  const sorted = useMemo(() => [...searched].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  }), [searched, sortKey, sortDir])

  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('desc') }
    setPage(0)
  }

  // cls = classes de visibilidade responsiva opcionais
  const th = (label: string, k: SortKey, cls?: string) => (
    <th key={k} onClick={() => handleSort(k)}
      className={clsx('px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide cursor-pointer hover:text-foreground/80 select-none whitespace-nowrap', cls)}>
      {label}{sortKey === k ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  )

  const exportCSV = () => {
    const headers = ['Cod','Nome','Cidade','UF','Dir Div','Dir Reg','Ger Reg','Jan','Fev','Mar','Abr','Mai','Meta','Venda','Desvio','Cresc%','Particip%','Ticket','Cancel%','SLAPreparo','NSU','Ruptura','SLAEntrega','TempoOn','PerdaTotal','Score','Status']
    const rows = sorted.map(l => [
      l.codigoLoja, l.nomeLoja, l.cidade, l.uf, l.diretorDivisional, l.diretorRegional, l.gerenteRegional,
      l.faturamentoJaneiro, l.faturamentoFevereiro, l.faturamentoMarco, l.faturamentoAbril, l.faturamentoMaio,
      l.meta, l.venda, l.desvio, l.crescimento, l.participacao, l.ticketMedio,
      l.cancelamentoTotal, l.slaPreparo, l.nsu, l.rupturaItem, l.slaEntrega, l.tempoOnline,
      l.perdaVendaTotal, l.scoreSaude, l.statusLoja,
    ].map(v => v === null || v === undefined ? '' : String(v)).join(';'))
    const csv = [headers.join(';'), ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dashboard.csv'; a.click()
  }

  return (
    <div className="glass-card rounded-xl border border-white/[0.06] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Buscar loja..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 w-36 sm:w-44" />
          <span className="text-xs text-gray-400">{sorted.length} lojas</span>
        </div>
        <button onClick={exportCSV} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-muted-foreground hover:bg-gray-50 transition cursor-pointer">
          Exportar CSV
        </button>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-xs min-w-[480px]">
          <thead className="bg-gray-50 border-b border-white/[0.06]">
            <tr>
              {th('Código',   'codigoLoja',          'hidden sm:table-cell')}
              {th('Nome',     'nomeLoja')}
              {th('UF',       'uf',                  'hidden md:table-cell')}
              {th('Cidade',   'cidade',              'hidden lg:table-cell')}
              {th('Dir. Reg.','diretorRegional',     'hidden xl:table-cell')}
              {th('Gerente',  'gerenteRegional',     'hidden xl:table-cell')}
              {th('Jan',      'faturamentoJaneiro',  'hidden xl:table-cell')}
              {th('Fev',      'faturamentoFevereiro','hidden xl:table-cell')}
              {th('Mar',      'faturamentoMarco',    'hidden xl:table-cell')}
              {th('Abr',      'faturamentoAbril',    'hidden xl:table-cell')}
              {th('Mai',      'faturamentoMaio',     'hidden xl:table-cell')}
              {th('Meta',     'meta',                'hidden lg:table-cell')}
              {th('Venda',    'venda')}
              {th('Desvio',   'desvio',              'hidden sm:table-cell')}
              {th('Cresc.',   'crescimento',         'hidden md:table-cell')}
              {th('Ticket',   'ticketMedio',         'hidden lg:table-cell')}
              {th('Cancel.',  'cancelamentoTotal',   'hidden md:table-cell')}
              {th('SLA Prep.','slaPreparo',          'hidden xl:table-cell')}
              {th('NSU',      'nsu',                 'hidden xl:table-cell')}
              {th('Ruptura',  'rupturaItem',         'hidden xl:table-cell')}
              {th('Tempo On', 'tempoOnline',         'hidden lg:table-cell')}
              {th('Perda',    'perdaVendaTotal',     'hidden lg:table-cell')}
              {th('Score',    'scoreSaude',          'hidden sm:table-cell')}
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(l => (
              <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-muted-foreground hidden sm:table-cell">{l.codigoLoja}</td>
                <td className="px-3 py-2">
                  <p className="font-medium text-foreground/80 whitespace-nowrap">{l.nomeLoja}</p>
                  <p className="text-[10px] text-gray-400 sm:hidden">{l.uf} · {fmtBRL(l.venda)}</p>
                </td>
                <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{l.uf}</td>
                <td className="px-3 py-2 text-muted-foreground hidden lg:table-cell">{l.cidade}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap hidden xl:table-cell">{l.diretorRegional}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap hidden xl:table-cell">{l.gerenteRegional}</td>
                <td className="px-3 py-2 text-right text-foreground/80 hidden xl:table-cell">{fmtBRL(l.faturamentoJaneiro)}</td>
                <td className="px-3 py-2 text-right text-foreground/80 hidden xl:table-cell">{fmtBRL(l.faturamentoFevereiro)}</td>
                <td className="px-3 py-2 text-right text-foreground/80 hidden xl:table-cell">{fmtBRL(l.faturamentoMarco)}</td>
                <td className="px-3 py-2 text-right text-foreground/80 hidden xl:table-cell">{fmtBRL(l.faturamentoAbril)}</td>
                <td className="px-3 py-2 text-right text-foreground/80 hidden xl:table-cell">{fmtBRL(l.faturamentoMaio)}</td>
                <td className="px-3 py-2 text-right text-foreground/80 hidden lg:table-cell">{fmtBRL(l.meta)}</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900">{fmtBRL(l.venda)}</td>
                <td className={clsx('px-3 py-2 text-right font-semibold hidden sm:table-cell',
                  l.desvio === null ? 'text-gray-400' : l.desvio >= 0 ? 'text-green-700' : 'text-destructive')}>
                  {fmtBRL(l.desvio)}
                </td>
                <td className={clsx('px-3 py-2 text-right hidden md:table-cell',
                  l.crescimento === null ? 'text-gray-400' : l.crescimento >= 0 ? 'text-green-700' : 'text-destructive')}>
                  {l.crescimento !== null ? fmtPct(l.crescimento) : '—'}
                </td>
                <td className="px-3 py-2 text-right text-foreground/80 hidden lg:table-cell">{fmtBRL(l.ticketMedio)}</td>
                {CELL_INDICADOR(l.cancelamentoTotal, 'cancelamento_total', 'hidden md:table-cell')}
                {CELL_INDICADOR(l.slaPreparo,        'sla_preparo',        'hidden xl:table-cell')}
                {CELL_INDICADOR(l.nsu,               'nsu',                'hidden xl:table-cell')}
                {CELL_INDICADOR(l.rupturaItem,       'ruptura_item',       'hidden xl:table-cell')}
                {CELL_INDICADOR(l.tempoOnline,       'tempo_online',       'hidden lg:table-cell')}
                <td className="px-3 py-2 text-right text-destructive font-medium hidden lg:table-cell">{fmtBRL(l.perdaVendaTotal)}</td>
                <td className="px-3 py-2 text-center font-bold text-foreground/80 hidden sm:table-cell">{l.scoreSaude}</td>
                <td className="px-3 py-2"><StatusBadge status={l.statusLoja} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <span className="text-xs text-gray-400">Pág. {page + 1}/{totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 cursor-pointer">← Ant.</button>
            <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 cursor-pointer">Próx. →</button>
          </div>
        </div>
      )}
    </div>
  )
}
