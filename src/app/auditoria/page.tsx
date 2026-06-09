'use client'

import { useEffect, useState } from 'react'
import type { DebugData } from '@/lib/googleSheets'
import type { Loja } from '@/types/dashboard'
import { fmtBRL, fmtPct } from '@/lib/formatters'
import {
  AlertTriangle, CheckCircle, RefreshCw,
  Search, Database, ShieldCheck, Eye, Table2,
} from 'lucide-react'
import KpiCard from '@/components/cards/KpiCard'

// ─── tipos ────────────────────────────────────────────────────────────────────

type SheetKey = 'indicadores' | 'vendasDiarias' | 'vendasAnuais' | 'cancelamento'

interface AuditData extends DebugData {
  _prodMode?: boolean
}

const SHEET_LABELS: Record<SheetKey, string> = {
  indicadores:   'Indicadores',
  vendasDiarias: 'Vendas Diárias',
  vendasAnuais:  'Vendas Anuais',
  cancelamento:  'Cancelamento',
}

type ColEntry = { idx: number; letra: string; campo: string; descricao: string }

const COLUMN_MAP: Record<SheetKey, ColEntry[]> = {
  indicadores: [
    { idx: 0,  letra: 'A',  campo: 'diretorDivisional',        descricao: 'Diretor Divisional' },
    { idx: 1,  letra: 'B',  campo: 'diretorRegional',          descricao: 'Diretor Regional' },
    { idx: 2,  letra: 'C',  campo: 'gerenteRegional',          descricao: 'Gerente Regional' },
    { idx: 3,  letra: 'D',  campo: 'codigoLoja',               descricao: 'Código da Loja (chave de merge)' },
    { idx: 4,  letra: 'E',  campo: 'nomeLoja',                 descricao: 'Nome da Loja' },
    { idx: 5,  letra: 'F',  campo: 'cidade',                   descricao: 'Cidade' },
    { idx: 6,  letra: 'G',  campo: 'uf',                       descricao: 'UF' },
    { idx: 7,  letra: 'H',  campo: 'faturamentoJaneiro',       descricao: 'Faturamento Janeiro (R$)' },
    { idx: 8,  letra: 'I',  campo: 'faturamentoFevereiro',     descricao: 'Faturamento Fevereiro (R$)' },
    { idx: 9,  letra: 'J',  campo: '—',                        descricao: 'Pulado (desvio jan ou coluna auxiliar)' },
    { idx: 10, letra: 'K',  campo: 'faturamentoMarco',         descricao: 'Faturamento Março (R$)' },
    { idx: 11, letra: 'L',  campo: '—',                        descricao: 'Pulado' },
    { idx: 12, letra: 'M',  campo: 'faturamentoAbril',         descricao: 'Faturamento Abril (R$)' },
    { idx: 13, letra: 'N',  campo: '—',                        descricao: 'Pulado' },
    { idx: 14, letra: 'O',  campo: 'meta',                     descricao: 'Meta mensal (R$)' },
    { idx: 15, letra: 'P',  campo: 'crescimento',              descricao: 'Crescimento % vs mês anterior' },
    { idx: 16, letra: 'Q',  campo: 'venda / faturamentoMaio',  descricao: 'Venda acumulada Maio (R$) — usado como mês atual' },
    { idx: 17, letra: 'R',  campo: 'desvio',                   descricao: 'Desvio vs meta (R$)' },
    { idx: 18, letra: 'S',  campo: 'participacao',             descricao: 'Participação % na rede' },
    { idx: 19, letra: 'T',  campo: 'ticketMedio',              descricao: 'Ticket médio (R$)' },
    { idx: 20, letra: 'U',  campo: '—',                        descricao: 'Pulado' },
    { idx: 21, letra: 'V',  campo: 'cancelamentoTotal',        descricao: 'Cancelamento % — meta ≤ 5%' },
    { idx: 22, letra: 'W',  campo: 'cancelamentoDesvio',       descricao: 'Cancelamento desvio %' },
    { idx: 23, letra: 'X',  campo: 'perdaCancelamento',        descricao: 'Perda por cancelamento (R$)' },
    { idx: 24, letra: 'Y',  campo: 'rupturaItem',              descricao: 'Ruptura de itens % — meta ≤ 5%' },
    { idx: 25, letra: 'Z',  campo: '—',                        descricao: 'Ruptura desvio %' },
    { idx: 26, letra: 'AA', campo: 'perdaRuptura',             descricao: 'Perda por ruptura (R$)' },
    { idx: 27, letra: 'AB', campo: 'tempoOnline',              descricao: '% downtime (parser inverte: uptime = 100 - v) — meta ≥ 95%' },
    { idx: 28, letra: 'AC', campo: 'perdaTempoOnline',         descricao: 'Perda por tempo offline (R$)' },
  ],
  vendasDiarias: [
    { idx: 0,  letra: 'A',  campo: 'diretorDivisional',        descricao: 'Diretor Divisional' },
    { idx: 1,  letra: 'B',  campo: 'diretorRegional',          descricao: 'Diretor Regional' },
    { idx: 2,  letra: 'C',  campo: 'gerenteRegional',          descricao: 'Gerente Regional' },
    { idx: 3,  letra: 'D',  campo: 'codigoLoja',               descricao: 'Código da Loja (chave de merge)' },
    { idx: 4,  letra: 'E',  campo: 'nomeLoja',                 descricao: 'Nome da Loja' },
    { idx: 5,  letra: 'F',  campo: 'cidade',                   descricao: 'Cidade' },
    { idx: 6,  letra: 'G',  campo: 'uf',                       descricao: 'UF' },
    { idx: 7,  letra: 'H',  campo: 'metaDia',                  descricao: 'Meta do dia (R$)' },
    { idx: 8,  letra: 'I',  campo: 'vendaDia',                 descricao: 'Venda do dia (R$)' },
    { idx: 9,  letra: 'J',  campo: 'desvioDia',                descricao: 'Desvio do dia (R$)' },
    { idx: 10, letra: 'K',  campo: 'crescimentoDia',           descricao: 'Crescimento diário %' },
    { idx: 11, letra: 'L',  campo: '—',                        descricao: 'Pulado (participação diária?)' },
    { idx: 12, letra: 'M',  campo: 'metaAcumulada',            descricao: 'Meta acumulada no mês (R$)' },
    { idx: 13, letra: 'N',  campo: 'vendaAcumulada',           descricao: 'Venda acumulada no mês (R$)' },
    { idx: 14, letra: 'O',  campo: 'desvioAcumulado',          descricao: 'Desvio acumulado (R$)' },
    { idx: 15, letra: 'P',  campo: 'crescimentoAcumulado',     descricao: 'Crescimento acumulado %' },
    { idx: 16, letra: 'Q',  campo: 'participacaoAcumulada',    descricao: 'Participação acumulada %' },
    { idx: 17, letra: 'R',  campo: 'ticketMedioDiario',        descricao: 'Ticket médio diário (R$)' },
    { idx: 18, letra: 'S',  campo: 'cancelamentoTotal',        descricao: 'Cancelamento acumulado no mês %' },
    { idx: 25, letra: 'Z',  campo: 'slaEntrega',               descricao: 'SLA Entrega % — meta ≥ 85%' },
    { idx: 26, letra: 'AA', campo: 'slaPreparo',               descricao: 'SLA Preparo % — meta ≥ 85%' },
    { idx: 27, letra: 'AB', campo: 'nsu',                      descricao: 'NSU % — meta ≤ 12%' },
  ],
  vendasAnuais: [
    { idx: 0,  letra: 'A',  campo: 'diretorDivisional',        descricao: 'Diretor Divisional' },
    { idx: 1,  letra: 'B',  campo: 'diretorRegional',          descricao: 'Diretor Regional' },
    { idx: 2,  letra: 'C',  campo: 'gerenteRegional',          descricao: 'Gerente Regional' },
    { idx: 3,  letra: 'D',  campo: 'codigoLoja',               descricao: 'Código da Loja (chave de merge)' },
    { idx: 4,  letra: 'E',  campo: 'nomeLoja',                 descricao: 'Nome da Loja' },
    { idx: 5,  letra: 'F',  campo: 'cidade',                   descricao: 'Cidade' },
    { idx: 6,  letra: 'G',  campo: 'uf',                       descricao: 'UF' },
    { idx: 7,  letra: 'H',  campo: '(janeiro)',                descricao: 'Faturamento Janeiro — lido da aba Indicadores' },
    { idx: 8,  letra: 'I',  campo: '(fevereiro)',              descricao: 'Faturamento Fevereiro — lido da aba Indicadores' },
    { idx: 9,  letra: 'J',  campo: '(março)',                  descricao: 'Faturamento Março — lido da aba Indicadores' },
    { idx: 10, letra: 'K',  campo: '(abril)',                  descricao: 'Faturamento Abril — lido da aba Indicadores' },
    { idx: 11, letra: 'L',  campo: '(maio)',                   descricao: 'Faturamento Maio — lido da aba Indicadores' },
    { idx: 12, letra: 'M',  campo: '—',                        descricao: 'Meta Junho (não lido diretamente)' },
    { idx: 13, letra: 'N',  campo: 'faturamentoJunho',         descricao: 'Faturamento Junho (R$) — quando disponível' },
    { idx: 23, letra: 'X',  campo: 'slaPreparo',               descricao: 'SLA Preparo % (fallback se aba diária não trouxer)' },
    { idx: 24, letra: 'Y',  campo: 'nsu',                      descricao: 'NSU % (fallback se aba diária não trouxer)' },
  ],
  cancelamento: [
    { idx: 0,  letra: 'A',  campo: 'diretorDivisional',        descricao: 'Diretor Divisional' },
    { idx: 1,  letra: 'B',  campo: 'diretorRegional',          descricao: 'Diretor Regional' },
    { idx: 2,  letra: 'C',  campo: 'gerenteRegional',          descricao: 'Gerente Regional' },
    { idx: 3,  letra: 'D',  campo: 'codigoLoja',               descricao: 'Código da Loja (chave de merge)' },
    { idx: 4,  letra: 'E',  campo: 'nomeLoja',                 descricao: 'Nome da Loja' },
    { idx: 5,  letra: 'F',  campo: 'cidade',                   descricao: 'Cidade' },
    { idx: 6,  letra: 'G',  campo: 'uf',                       descricao: 'UF' },
    { idx: 7,  letra: 'H',  campo: '—',                        descricao: 'Total Abril (col 1 de 3)' },
    { idx: 8,  letra: 'I',  campo: '—',                        descricao: 'Total Abril (col 2 de 3)' },
    { idx: 9,  letra: 'J',  campo: 'cancelamentoAbril',        descricao: 'Cancelamento % Abril (total)' },
    { idx: 10, letra: 'K',  campo: '—',                        descricao: 'Total Maio (col 1 de 3)' },
    { idx: 11, letra: 'L',  campo: '—',                        descricao: 'Total Maio (col 2 de 3)' },
    { idx: 12, letra: 'M',  campo: '—',                        descricao: 'Total Maio (col 3 de 3)' },
    { idx: 13, letra: 'N',  campo: '—',                        descricao: 'Variação Abr × Mai' },
    { idx: 14, letra: 'O',  campo: 'cancelamentoCliente',      descricao: 'Cancelamento por Cliente % (Maio)' },
    { idx: 15, letra: 'P',  campo: '—',                        descricao: 'Cancelamento por Cliente % (Abril)' },
    { idx: 16, letra: 'Q',  campo: '—',                        descricao: 'Desvio cancelamento cliente' },
    { idx: 17, letra: 'R',  campo: 'cancelamentoLoja',         descricao: 'Cancelamento pela Loja % (Maio)' },
    { idx: 18, letra: 'S',  campo: '—',                        descricao: 'Cancelamento pela Loja % (Abril)' },
    { idx: 19, letra: 'T',  campo: '—',                        descricao: 'Desvio cancelamento loja' },
    { idx: 20, letra: 'U',  campo: 'cancelamentoEntregador',   descricao: 'Cancelamento por Entregador % (Maio)' },
    { idx: 21, letra: 'V',  campo: '—',                        descricao: 'Cancelamento por Entregador % (Abril)' },
    { idx: 22, letra: 'W',  campo: '—',                        descricao: 'Desvio cancelamento entregador' },
    { idx: 23, letra: 'X',  campo: 'cancelamentoTotalR',       descricao: 'Valor cancelado total (R$)' },
    { idx: 24, letra: 'Y',  campo: 'cancelamentoClienteR',     descricao: 'Valor cancelado por cliente (R$)' },
    { idx: 25, letra: 'Z',  campo: 'cancelamentoLojaR',        descricao: 'Valor cancelado pela loja (R$)' },
    { idx: 26, letra: 'AA', campo: 'cancelamentoEntregadorR',  descricao: 'Valor cancelado por entregador (R$)' },
  ],
}

const CAMPOS: { key: keyof Loja; label: string; fmt: (v: number | null) => string; meta?: string }[] = [
  { key: 'meta',              label: 'Meta',          fmt: fmtBRL },
  { key: 'venda',             label: 'Venda',         fmt: fmtBRL },
  { key: 'cancelamentoTotal', label: 'Cancelamento',  fmt: fmtPct, meta: '≤ 5%' },
  { key: 'rupturaItem',       label: 'Ruptura',       fmt: fmtPct, meta: '≤ 5%' },
  { key: 'tempoOnline',       label: 'Tempo ON',      fmt: fmtPct, meta: '≥ 95%' },
  { key: 'slaPreparo',        label: 'SLA Preparo',   fmt: fmtPct, meta: '≥ 85%' },
  { key: 'nsu',               label: 'NSU',           fmt: fmtPct, meta: '≤ 12%' },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildNullCounts(lojas: Loja[]): Record<string, number> {
  return Object.fromEntries(
    CAMPOS.map(c => [c.key, lojas.filter(l => (l[c.key] as number | null) === null).length])
  )
}

// ─── componente ───────────────────────────────────────────────────────────────

export default function AuditoriaPage() {
  const [data, setData]       = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [search, setSearch]   = useState('')
  const [selectedLoja, setSelectedLoja] = useState('')
  const [activeSheet, setActiveSheet]   = useState<SheetKey>('indicadores')
  const [mapSheet, setMapSheet]         = useState<SheetKey>('indicadores')

  async function load() {
    setLoading(true); setError(null)
    try {
      const isProd = process.env.NODE_ENV === 'production'
      const url    = isProd
        ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? '/dashboard-performance'}/data.json`
        : '/api/debug'

      const res  = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      if (isProd || !json.rawSheets) {
        const lojas: Loja[] = json.lojas ?? []
        setData({
          updatedAt: json.updatedAt ?? new Date().toISOString(),
          rawSheets: {
            indicadores:   { name: '', headerRows: [], dataRows: [], rowCount: 0 },
            vendasDiarias: { name: '', headerRows: [], dataRows: [], rowCount: 0 },
            vendasAnuais:  { name: '', headerRows: [], dataRows: [], rowCount: 0 },
            cancelamento:  { name: '', headerRows: [], dataRows: [], rowCount: 0 },
          },
          lojas,
          stats: {
            rowCounts:  { indicadores: 0, vendasDiarias: 0, vendasAnuais: 0, cancelamento: 0 },
            totalLojas: lojas.length,
            nullCounts: buildNullCounts(lojas),
          },
          _prodMode: true,
        })
      } else {
        setData(json)
      }
    } catch (e) { setError(String(e)) }
    finally     { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // ── estados de carregamento ──────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
        <p className="text-sm">Carregando dados da auditoria...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="rounded-xl border border-red-100 bg-red-50 p-8 max-w-lg text-center shadow-card">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-700 font-semibold mb-1">Erro ao carregar auditoria</p>
        <p className="text-xs text-red-500 font-mono break-all">{error}</p>
        <p className="text-xs text-slate-400 mt-3">
          Verifique se as credenciais do Google estão configuradas (<code>credentials.json</code> ou <code>GOOGLE_CREDENTIALS</code>).
        </p>
        <button onClick={load} className="mt-4 text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium cursor-pointer">
          Tentar novamente
        </button>
      </div>
    </div>
  )

  const { rawSheets, lojas, stats } = data
  const isProd = data._prodMode

  const lojasNulas = lojas.filter(l => CAMPOS.some(c => (l[c.key] as number | null) === null))

  const lojasVisiveis = lojas.filter(l =>
    !search ||
    l.nomeLoja.toLowerCase().includes(search.toLowerCase()) ||
    l.codigoLoja.includes(search)
  )

  const lojaInspecionada  = lojas.find(l => l.codigoLoja === selectedLoja)
  const rawLoja           = selectedLoja ? (rawSheets[activeSheet]?.dataRows ?? []).find(r => r.codigoLoja === selectedLoja) : null
  const headers           = rawSheets[activeSheet]?.headerRows ?? []

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            Auditoria de Dados
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Verifique se os dados da planilha estão sendo lidos e parseados corretamente
            {' · '}Atualizado: {new Date(data.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors font-semibold cursor-pointer shadow-sm flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Recarregar
        </button>
      </div>

      {/* Banner produção ── */}
      {isProd && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-semibold">Modo produção — dados brutos indisponíveis</p>
            <p className="text-xs text-amber-600 mt-0.5">
              A inspeção coluna-a-coluna requer <code className="bg-amber-100 px-1 rounded">npm run dev</code> com as credenciais configuradas.
              Os campos críticos (nulos) funcionam normalmente.
            </p>
          </div>
        </div>
      )}

      {/* ── Seção 1: KPIs de leitura ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          Linhas lidas por aba da planilha
        </h3>
        <div className="kpi-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.entries(SHEET_LABELS) as [SheetKey, string][]).map(([key, label]) => (
            <KpiCard
              key={key}
              title={label}
              value={isProd ? 'N/A' : (stats.rowCounts[key] ?? 0)}
              subtitle={isProd ? 'disponível em dev' : 'linhas lidas'}
              color="default"
            />
          ))}
          <KpiCard
            title="Total — Lojas no Dashboard"
            value={stats.totalLojas}
            subtitle="após merge das abas"
            color="blue"
          />
        </div>
      </section>

      {/* ── Seção 2: Campos críticos nulos ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Campos críticos com valor nulo
          <span className="font-normal normal-case text-slate-300">— vermelho = dado ausente da planilha (provavelmente coluna errada)</span>
        </h3>

        <div className="kpi-grid grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
          {CAMPOS.map(c => {
            const count = stats.nullCounts[c.key as string] ?? 0
            const ok = count === 0
            return (
              <KpiCard
                key={String(c.key)}
                title={c.label}
                value={count}
                subtitle={ok ? '✓ sem nulos' : `lojas sem dado${c.meta ? ` (meta ${c.meta})` : ''}`}
                color={ok ? 'green' : 'red'}
              />
            )
          })}
        </div>

        {lojasNulas.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-x-auto">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">
                {lojasNulas.length} {lojasNulas.length === 1 ? 'loja com campo nulo' : 'lojas com campos nulos'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Células em vermelho indicam dado ausente — verifique a coluna correspondente na planilha</p>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wide">Loja</th>
                  {CAMPOS.map(c => (
                    <th key={String(c.key)} className="px-3 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wide whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lojasNulas.map(loja => (
                  <tr key={loja.codigoLoja} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-slate-400 mr-1.5 font-mono text-[10px]">{loja.codigoLoja}</span>
                      <span className="font-medium text-slate-800">
                        {loja.nomeLoja.replace(' (Projeto Olimpo)', '').slice(0, 28)}
                      </span>
                    </td>
                    {CAMPOS.map(c => {
                      const val = loja[c.key] as number | null
                      const isNull = val === null || val === undefined
                      return (
                        <td key={String(c.key)} className="px-3 py-2.5 whitespace-nowrap">
                          {isNull ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-2.5 h-2.5" /> NULL
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-2.5 h-2.5" /> {c.fmt(val)}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lojasNulas.length === 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Todos os campos críticos estão preenchidos</p>
              <p className="text-xs text-emerald-600 mt-0.5">Nenhuma loja com valor nulo nos KPIs principais.</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Seção 3: Mapeamento de colunas ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Table2 className="w-3.5 h-3.5" />
          Mapeamento de colunas assumido pelo parser
          <span className="font-normal normal-case text-slate-300">— abra a planilha lado a lado e confirme que as letras batem</span>
        </h3>

        <div className="flex gap-1 flex-wrap mb-3">
          {(Object.entries(SHEET_LABELS) as [SheetKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMapSheet(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mapSheet === key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wide w-16">Letra</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wide w-12">Índice</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wide">Campo no Dashboard</th>
                <th className="px-3 py-2.5 text-left text-slate-400 font-semibold uppercase tracking-wide">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {COLUMN_MAP[mapSheet].map(({ idx, letra, campo, descricao }) => {
                const isSkip = campo === '—'
                return (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isSkip ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-2 font-mono font-bold text-brand-700">{letra}</td>
                    <td className="px-3 py-2 font-mono text-slate-400">{idx}</td>
                    <td className="px-3 py-2">
                      {isSkip ? (
                        <span className="text-slate-300 italic">coluna ignorada</span>
                      ) : (
                        <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{campo}</code>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{descricao}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Seção 4: Inspeção bruto vs parseado (dev only) ── */}
      {!isProd && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Inspeção coluna a coluna — bruto vs parseado
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar loja..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-white outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100"
              />
            </div>
            <select
              value={selectedLoja}
              onChange={e => setSelectedLoja(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white text-sm text-slate-700 px-3 py-2 outline-none focus:border-brand-400 flex-1 min-w-[200px] max-w-sm"
            >
              <option value="">-- Selecionar loja --</option>
              {lojasVisiveis.map(l => (
                <option key={l.codigoLoja} value={l.codigoLoja}>
                  {l.codigoLoja} — {l.nomeLoja.replace(' (Projeto Olimpo)', '').slice(0, 32)}
                </option>
              ))}
            </select>
            <div className="flex gap-1 flex-wrap">
              {(Object.entries(SHEET_LABELS) as [SheetKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveSheet(key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    activeSheet === key
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {selectedLoja && lojaInspecionada ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-x-auto">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">
                  {lojaInspecionada.codigoLoja} — {lojaInspecionada.nomeLoja.replace(' (Projeto Olimpo)', '')}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aba: <span className="text-brand-600 font-medium">{SHEET_LABELS[activeSheet]}</span>
                  {rawLoja
                    ? ` · ${rawLoja.values.length} colunas`
                    : ' · Loja não encontrada nesta aba'}
                </p>
              </div>
              {rawLoja ? (
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-slate-500 font-semibold w-10">#</th>
                      <th className="px-3 py-2.5 text-left text-slate-500 font-semibold">Cabeçalho (L1)</th>
                      <th className="px-3 py-2.5 text-left text-slate-400 font-semibold">Cabeçalho (L2)</th>
                      <th className="px-3 py-2.5 text-left text-slate-500 font-semibold">Valor bruto da planilha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rawLoja.values.map((cell, i) => {
                      const h1 = headers[0]?.[i] ?? ''
                      const h2 = headers[1]?.[i] ?? ''
                      const hasValue = cell !== '' && cell !== null && cell !== undefined
                      return (
                        <tr key={i} className={`hover:bg-blue-50/30 transition-colors ${!hasValue ? 'opacity-40' : ''}`}>
                          <td className="px-4 py-2 font-mono text-slate-300">{i}</td>
                          <td className="px-3 py-2 text-slate-700 font-medium">{h1}</td>
                          <td className="px-3 py-2 text-slate-400">{h2}</td>
                          <td className="px-3 py-2 font-mono text-brand-700 font-semibold">
                            {hasValue ? cell : <span className="text-slate-300 italic font-sans font-normal">vazio</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Loja não encontrada na aba <strong>{SHEET_LABELS[activeSheet]}</strong>.
                </p>
              )}
            </div>
          ) : !selectedLoja ? (
            <div className="rounded-xl border border-slate-200 border-dashed px-6 py-10 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Selecione uma loja para inspecionar os dados brutos coluna a coluna</p>
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
