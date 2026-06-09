'use client'
import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { X, SlidersHorizontal, Download } from 'lucide-react'
import type { Loja } from '@/types/dashboard'
import { fmtBRL, fmtPct } from '@/lib/formatters'
import StatusBadge from '@/components/common/StatusBadge'
import GlassSelect from '@/components/common/GlassSelect'
import { statusIndicador } from '@/lib/statusRules'
import { useFilters } from '@/context/FilterContext'

type SortKey = keyof Loja
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 25

const MESES = [
  { id: 'jan', label: 'JAN', key: 'faturamentoJaneiro'   as SortKey },
  { id: 'fev', label: 'FEV', key: 'faturamentoFevereiro' as SortKey },
  { id: 'mar', label: 'MAR', key: 'faturamentoMarco'     as SortKey },
  { id: 'abr', label: 'ABR', key: 'faturamentoAbril'     as SortKey },
  { id: 'mai', label: 'MAI', key: 'faturamentoMaio'      as SortKey },
  { id: 'jun', label: 'JUN', key: 'faturamentoJunho'     as SortKey },
]

function CellIndicador({ val, ind, cls }: {
  val: number | null
  ind: Parameters<typeof statusIndicador>[0]
  cls?: string
}) {
  const cor = statusIndicador(ind, val)
  const colorCls = {
    verde: 'text-success', amarelo: 'text-warning',
    vermelho: 'text-destructive', neutro: 'text-muted-foreground',
  }[cor]
  return (
    <td className={clsx('px-3 py-2 text-right text-xs font-medium', colorCls, cls)}>
      {val !== null ? fmtPct(val) : '—'}
    </td>
  )
}

interface Props { lojas: Loja[] }

export default function StoreDetailTable({ lojas }: Props) {
  const { filtros, setFiltro, resetFiltros, opcoesUnicas } = useFilters()

  const [sortKey, setSortKey]           = useState<SortKey>('scoreSaude')
  const [sortDir, setSortDir]           = useState<SortDir>('desc')
  const [page, setPage]                 = useState(0)
  const [search, setSearch]             = useState('')
  const [mesSelecionado, setMes]        = useState<string | null>(null)
  const [showFilters, setShowFilters]   = useState(true)

  const toOpts = (arr: string[]) => arr.map(v => ({ value: v, label: v }))

  const selectMes = (id: string | null) => {
    setMes(id)
    if (id) {
      const m = MESES.find(m => m.id === id)
      if (m) { setSortKey(m.key); setSortDir('desc') }
    }
    setPage(0)
  }

  const activeGlobalCount = [
    filtros.diretorDivisional, filtros.diretorRegional, filtros.gerenteRegional,
    filtros.statusLoja, filtros.uf, filtros.cidade, filtros.projetoOlimpo,
  ].filter(Boolean).length

  const hasAnyFilter = !!search || !!mesSelecionado || activeGlobalCount > 0

  const clearAll = () => {
    setSearch('')
    selectMes(null)
    setSortKey('scoreSaude')
    setSortDir('desc')
    resetFiltros()
    setPage(0)
  }

  const searched = useMemo(() =>
    search
      ? lojas.filter(l =>
          l.nomeLoja.toLowerCase().includes(search.toLowerCase()) ||
          l.codigoLoja.includes(search))
      : lojas,
  [lojas, search])

  const sorted = useMemo(() => [...searched].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey]
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  }), [searched, sortKey, sortDir])

  const pageData   = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('desc') }
    setPage(0)
  }

  const mesFatKey = mesSelecionado ? MESES.find(m => m.id === mesSelecionado)?.key : null

  const th = (label: string, k: SortKey, cls?: string, highlight?: boolean) => (
    <th key={String(k)} onClick={() => handleSort(k)}
      className={clsx(
        'px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap',
        highlight ? 'text-brand-400 bg-brand-500/10' : 'text-muted-foreground hover:text-foreground/80',
        cls,
      )}>
      {label}{sortKey === k ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  )

  const exportCSV = () => {
    const headers = ['Cod','Nome','Cidade','UF','Dir Div','Dir Reg','Ger Reg','Jan','Fev','Mar','Abr','Mai','Jun','Meta','Venda','Desvio','Cresc%','Particip%','Ticket','Cancel%','SLAPreparo','NSU','Ruptura','SLAEntrega','TempoOn','PerdaTotal','Score','Status']
    const rows = sorted.map(l => [
      l.codigoLoja, l.nomeLoja, l.cidade, l.uf, l.diretorDivisional, l.diretorRegional, l.gerenteRegional,
      l.faturamentoJaneiro, l.faturamentoFevereiro, l.faturamentoMarco, l.faturamentoAbril, l.faturamentoMaio, l.faturamentoJunho,
      l.meta, l.venda, l.desvio, l.crescimento, l.participacao, l.ticketMedio,
      l.cancelamentoTotal, l.slaPreparo, l.nsu, l.rupturaItem, l.slaEntrega, l.tempoOnline,
      l.perdaVendaTotal, l.scoreSaude, l.statusLoja,
    ].map(v => v === null || v === undefined ? '' : String(v)).join(';'))
    const csv = [headers.join(';'), ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `dashboard${mesSelecionado ? '-' + mesSelecionado : ''}.csv`
    a.click()
  }

  return (
    <div className="glass-card rounded-xl border border-white/[0.06] shadow-sm">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex flex-wrap items-center gap-2">
        {/* Search */}
        <input
          type="text"
          placeholder="Buscar loja ou código..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white/[0.06] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 w-44 sm:w-52"
        />

        {/* Chips de mês */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mr-0.5 hidden sm:block">Mês:</span>
          {MESES.map(m => (
            <button key={m.id} onClick={() => selectMes(mesSelecionado === m.id ? null : m.id)}
              className={clsx(
                'text-[11px] font-semibold px-2 py-1 rounded-md transition-all cursor-pointer',
                mesSelecionado === m.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-white/[0.08] hover:text-foreground',
              )}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">{sorted.length} lojas</span>

          {/* Toggle filtros */}
          <button onClick={() => setShowFilters(f => !f)}
            className={clsx(
              'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer',
              showFilters
                ? 'border-brand-500/40 text-brand-400 bg-brand-500/10'
                : 'border-border text-muted-foreground hover:bg-white/[0.04]',
            )}>
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">Filtros</span>
            {activeGlobalCount > 0 && (
              <span className="bg-brand-600 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                {activeGlobalCount}
              </span>
            )}
          </button>

          {hasAnyFilter && (
            <button onClick={clearAll}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition cursor-pointer">
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}

          <button onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-white/[0.04] transition cursor-pointer">
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* ── Painel de filtros ─────────────────────────────────────────────── */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex flex-wrap gap-2">
          <GlassSelect
            label="Dir. Divisional"
            value={filtros.diretorDivisional}
            options={toOpts(opcoesUnicas.diretoresDivisionais)}
            onChange={v => { setFiltro('diretorDivisional', v); setPage(0) }}
            className="min-w-[130px] flex-1 sm:flex-none"
          />
          <GlassSelect
            label="Dir. Regional"
            value={filtros.diretorRegional}
            options={toOpts(opcoesUnicas.diretoresRegionais)}
            onChange={v => { setFiltro('diretorRegional', v); setPage(0) }}
            className="min-w-[130px] flex-1 sm:flex-none"
          />
          <GlassSelect
            label="Ger. Regional"
            value={filtros.gerenteRegional}
            options={toOpts(opcoesUnicas.gerentesRegionais)}
            onChange={v => { setFiltro('gerenteRegional', v); setPage(0) }}
            className="min-w-[130px] flex-1 sm:flex-none"
            searchable
          />
          <GlassSelect
            label="Status"
            value={filtros.statusLoja}
            options={[
              { value: 'Saudável', label: '✅ Saudável' },
              { value: 'Atenção',  label: '⚠️ Atenção'  },
              { value: 'Crítica',  label: '🔴 Crítica'  },
            ]}
            onChange={v => { setFiltro('statusLoja', v); setPage(0) }}
            className="min-w-[110px] flex-1 sm:flex-none"
          />
          <GlassSelect
            label="UF"
            value={filtros.uf}
            options={toOpts(opcoesUnicas.ufs)}
            onChange={v => { setFiltro('uf', v); setPage(0) }}
            className="min-w-[80px] flex-1 sm:flex-none"
          />
          <GlassSelect
            label="Cidade"
            value={filtros.cidade}
            options={toOpts(opcoesUnicas.cidades)}
            onChange={v => { setFiltro('cidade', v); setPage(0) }}
            className="min-w-[130px] flex-1 sm:flex-none"
            searchable
          />
          <GlassSelect
            label="Olimpo"
            value={filtros.projetoOlimpo}
            options={[
              { value: 'sim', label: 'Olimpo' },
              { value: 'nao', label: 'Não Olimpo' },
            ]}
            onChange={v => { setFiltro('projetoOlimpo', v); setPage(0) }}
            className="min-w-[110px] flex-1 sm:flex-none"
          />
        </div>
      )}

      {/* ── Tabela ────────────────────────────────────────────────────────── */}
      <div className="overflow-auto">
        <table className="w-full text-xs min-w-[480px]">
          <thead className="bg-card border-b border-border">
            <tr>
              {th('Código',    'codigoLoja',          'hidden sm:table-cell')}
              {th('Nome',      'nomeLoja')}
              {th('UF',        'uf',                  'hidden md:table-cell')}
              {th('Cidade',    'cidade',              'hidden lg:table-cell')}
              {th('Dir. Reg.', 'diretorRegional',     'hidden xl:table-cell')}
              {th('Gerente',   'gerenteRegional',     'hidden xl:table-cell')}
              {th('JAN', 'faturamentoJaneiro',  'hidden xl:table-cell', mesFatKey === 'faturamentoJaneiro')}
              {th('FEV', 'faturamentoFevereiro','hidden xl:table-cell', mesFatKey === 'faturamentoFevereiro')}
              {th('MAR', 'faturamentoMarco',    'hidden xl:table-cell', mesFatKey === 'faturamentoMarco')}
              {th('ABR', 'faturamentoAbril',    'hidden xl:table-cell', mesFatKey === 'faturamentoAbril')}
              {th('MAI', 'faturamentoMaio',     'hidden xl:table-cell', mesFatKey === 'faturamentoMaio')}
              {th('JUN', 'faturamentoJunho',    'hidden xl:table-cell', mesFatKey === 'faturamentoJunho')}
              {th('Meta',      'meta',                'hidden lg:table-cell')}
              {th('Venda',     'venda')}
              {th('Desvio',    'desvio',              'hidden sm:table-cell')}
              {th('Cresc.',    'crescimento',         'hidden md:table-cell')}
              {th('Ticket',    'ticketMedio',         'hidden lg:table-cell')}
              {th('Cancel.',   'cancelamentoTotal',   'hidden md:table-cell')}
              {th('SLA Prep.', 'slaPreparo',          'hidden xl:table-cell')}
              {th('NSU',       'nsu',                 'hidden xl:table-cell')}
              {th('Ruptura',   'rupturaItem',         'hidden xl:table-cell')}
              {th('Tempo On',  'tempoOnline',         'hidden lg:table-cell')}
              {th('Perda',     'perdaVendaTotal',     'hidden lg:table-cell')}
              {th('Score',     'scoreSaude',          'hidden sm:table-cell')}
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(l => {
              const fatMes = mesFatKey ? (l[mesFatKey] as number | null) : null
              return (
                <tr key={l.id} className="border-b border-border hover:bg-white/[0.04]">
                  <td className="px-3 py-2 font-mono text-muted-foreground hidden sm:table-cell">{l.codigoLoja}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-foreground/80 whitespace-nowrap">{l.nomeLoja}</p>
                    <p className="text-[10px] text-muted-foreground sm:hidden">{l.uf} · {fmtBRL(l.venda)}</p>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{l.uf}</td>
                  <td className="px-3 py-2 text-muted-foreground hidden lg:table-cell">{l.cidade}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap hidden xl:table-cell">{l.diretorRegional}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap hidden xl:table-cell">{l.gerenteRegional}</td>
                  {/* Colunas de mês — destaca o selecionado */}
                  {MESES.map(m => (
                    <td key={m.id}
                      className={clsx(
                        'px-3 py-2 text-right hidden xl:table-cell',
                        mesFatKey === m.key
                          ? 'text-brand-400 font-bold bg-brand-500/5'
                          : 'text-foreground/80',
                      )}>
                      {fmtBRL(l[m.key] as number | null)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right text-foreground/80 hidden lg:table-cell">{fmtBRL(l.meta)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-foreground">
                    {mesSelecionado && fatMes !== null
                      ? <span className="text-brand-400">{fmtBRL(fatMes)}</span>
                      : fmtBRL(l.venda)}
                  </td>
                  <td className={clsx('px-3 py-2 text-right font-semibold hidden sm:table-cell',
                    l.desvio === null ? 'text-muted-foreground' : l.desvio >= 0 ? 'text-success' : 'text-destructive')}>
                    {fmtBRL(l.desvio)}
                  </td>
                  <td className={clsx('px-3 py-2 text-right hidden md:table-cell',
                    l.crescimento === null ? 'text-muted-foreground' : l.crescimento >= 0 ? 'text-success' : 'text-destructive')}>
                    {l.crescimento !== null ? fmtPct(l.crescimento) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-foreground/80 hidden lg:table-cell">{fmtBRL(l.ticketMedio)}</td>
                  <CellIndicador val={l.cancelamentoTotal} ind="cancelamento_total" cls="hidden md:table-cell" />
                  <CellIndicador val={l.slaPreparo}        ind="sla_preparo"        cls="hidden xl:table-cell" />
                  <CellIndicador val={l.nsu}               ind="nsu"               cls="hidden xl:table-cell" />
                  <CellIndicador val={l.rupturaItem}       ind="ruptura_item"       cls="hidden xl:table-cell" />
                  <CellIndicador val={l.tempoOnline}       ind="tempo_online"       cls="hidden lg:table-cell" />
                  <td className="px-3 py-2 text-right text-destructive font-medium hidden lg:table-cell">{fmtBRL(l.perdaVendaTotal)}</td>
                  <td className="px-3 py-2 text-center font-bold text-foreground/80 hidden sm:table-cell">{l.scoreSaude}</td>
                  <td className="px-3 py-2"><StatusBadge status={l.statusLoja} size="sm" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Paginação ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <span className="text-xs text-muted-foreground">Pág. {page + 1}/{totalPages} · {sorted.length} lojas</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-white/[0.04] cursor-pointer">
              ← Ant.
            </button>
            <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-white/[0.04] cursor-pointer">
              Próx. →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
