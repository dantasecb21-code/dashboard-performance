'use client'

import { useEffect, useState } from 'react'
import type { DebugData } from '@/lib/googleSheets'
import type { Loja } from '@/types/dashboard'
import { fmtBRL, fmtPct } from '@/lib/formatters'
import { AlertTriangle, CheckCircle, RefreshCw, Search } from 'lucide-react'

const CAMPOS_CRITICOS: { key: keyof Loja; label: string; fmt: (v: number | null) => string }[] = [
  { key: 'meta',              label: 'Meta',         fmt: fmtBRL },
  { key: 'venda',             label: 'Venda',        fmt: fmtBRL },
  { key: 'cancelamentoTotal', label: 'Cancelamento', fmt: (v) => fmtPct(v) },
  { key: 'rupturaItem',       label: 'Ruptura',      fmt: (v) => fmtPct(v) },
  { key: 'tempoOnline',       label: 'Tempo ON',     fmt: (v) => fmtPct(v) },
  { key: 'slaPreparo',        label: 'SLA Preparo',  fmt: (v) => fmtPct(v) },
  { key: 'nsu',               label: 'NSU',          fmt: (v) => fmtPct(v) },
]

type SheetKey = 'indicadores' | 'vendasDiarias' | 'vendasAnuais' | 'cancelamento'

const SHEET_LABELS: Record<SheetKey, string> = {
  indicadores: 'Indicadores',
  vendasDiarias: 'Vendas Diárias',
  vendasAnuais: 'Vendas Anuais',
  cancelamento: 'Cancelamento',
}

export default function AuditoriaPage() {
  const [data, setData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedLoja, setSelectedLoja] = useState<string>('')
  const [activeSheet, setActiveSheet] = useState<SheetKey>('indicadores')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      // Em produção (GitHub Pages) a API não existe — use npm run dev para auditoria completa
      const isProd = process.env.NODE_ENV === 'production'
      const url = isProd
        ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? '/dashboard-performance'}/data.json`
        : '/api/debug'
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${url}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      // data.json em produção tem formato { lojas, updatedAt } — wrappear para DebugData
      if (isProd && json.lojas && !json.rawSheets) {
        setData({
          updatedAt: json.updatedAt ?? new Date().toISOString(),
          rawSheets: { indicadores: { name: '', headerRows: [], dataRows: [], rowCount: 0 }, vendasDiarias: { name: '', headerRows: [], dataRows: [], rowCount: 0 }, vendasAnuais: { name: '', headerRows: [], dataRows: [], rowCount: 0 }, cancelamento: { name: '', headerRows: [], dataRows: [], rowCount: 0 } },
          lojas: json.lojas,
          stats: {
            rowCounts: { indicadores: 0, vendasDiarias: 0, vendasAnuais: 0, cancelamento: 0 },
            totalLojas: json.lojas.length,
            nullCounts: buildNullCounts(json.lojas),
          },
          _prodMode: true,
        } as DebugData & { _prodMode?: boolean })
      } else {
        setData(json)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function buildNullCounts(lojas: Loja[]) {
    const fields: (keyof Loja)[] = ['meta', 'venda', 'cancelamentoTotal', 'rupturaItem', 'tempoOnline', 'slaPreparo', 'nsu']
    return Object.fromEntries(fields.map(f => [f, lojas.filter(l => l[f] === null).length]))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-brand-400" />
        <p className="text-sm">Carregando dados brutos da planilha...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="rounded-xl border border-red-800 bg-red-950/40 p-8 max-w-lg text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-300 font-medium mb-1">Erro ao carregar dados de auditoria</p>
        <p className="text-xs text-red-400 font-mono">{error}</p>
        <p className="text-xs text-slate-500 mt-3">Verifique se as credenciais do Google estão configuradas.</p>
      </div>
    </div>
  )

  const { rawSheets, lojas, stats } = data
  const isProdMode = (data as DebugData & { _prodMode?: boolean })._prodMode

  const lojasComNulo = lojas.filter(l =>
    CAMPOS_CRITICOS.some(c => l[c.key] === null || l[c.key] === undefined)
  )

  const filteredLojas = lojas.filter(l =>
    !search || l.nomeLoja.toLowerCase().includes(search.toLowerCase()) || l.codigoLoja.includes(search)
  )

  const lojaInspecionada = lojas.find(l => l.codigoLoja === selectedLoja)
  const rawInspecionada = selectedLoja
    ? (rawSheets[activeSheet]?.dataRows ?? []).find(r => r.codigoLoja === selectedLoja)
    : null
  const headersInspecionados = rawSheets[activeSheet]?.headerRows ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Auditoria de Dados</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dados brutos da planilha vs valores parseados · Atualizado: {new Date(data.updatedAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors font-medium cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Recarregar
        </button>
      </div>

      {isProdMode && (
        <div className="rounded-xl border border-amber-800/50 bg-amber-900/20 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-300 font-medium">Modo produção — dados brutos indisponíveis</p>
            <p className="text-xs text-amber-600 mt-0.5">
              A seção "Inspeção Bruto vs Parseado" requer <code className="text-amber-400">npm run dev</code> localmente com as credenciais configuradas.
              As seções de campos nulos funcionam normalmente.
            </p>
          </div>
        </div>
      )}

      {/* Seção 1: Resumo por aba */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Resumo por Aba da Planilha
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.entries(SHEET_LABELS) as [SheetKey, string][]).map(([key, label]) => (
            <div key={key} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.rowCounts[key] ?? 0}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">linhas lidas</p>
            </div>
          ))}
          <div className="rounded-xl border border-brand-700/50 bg-brand-900/30 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-400">Total Merged</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalLojas}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">lojas no dashboard</p>
          </div>
        </div>
      </div>

      {/* Seção 2: Campos nulos */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Campos Críticos com Valor Nulo
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(stats.nullCounts).map(([field, count]) => {
            const label = CAMPOS_CRITICOS.find(c => c.key === field)?.label ?? field
            const ok = count === 0
            return (
              <div
                key={field}
                className={`rounded-xl border p-4 ${ok ? 'border-green-800/50 bg-green-900/20' : 'border-red-800/50 bg-red-900/20'}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {ok
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  }
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                </div>
                <p className={`text-xl font-bold ${ok ? 'text-green-300' : 'text-red-300'}`}>{count}</p>
                <p className="text-[10px] text-slate-500">lojas nulas</p>
              </div>
            )
          })}
        </div>

        {lojasComNulo.length > 0 && (
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/50 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium">Loja</th>
                  {CAMPOS_CRITICOS.map(c => (
                    <th key={c.key} className="px-3 py-2 text-left text-slate-400 font-medium whitespace-nowrap">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {lojasComNulo.map(loja => (
                  <tr key={loja.codigoLoja} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-2 font-medium text-white whitespace-nowrap">
                      <span className="text-slate-500 mr-1">{loja.codigoLoja}</span>
                      {loja.nomeLoja.replace(' (Projeto Olimpo)', '').slice(0, 25)}
                    </td>
                    {CAMPOS_CRITICOS.map(c => {
                      const val = loja[c.key] as number | null
                      const isNull = val === null || val === undefined
                      return (
                        <td key={c.key} className={`px-3 py-2 whitespace-nowrap ${isNull ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>
                          {isNull ? 'NULL' : c.fmt(val)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seção 3: Inspeção por loja */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Inspeção Bruto vs Parseado por Loja
        </h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar loja..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-500"
            />
          </div>
          <select
            value={selectedLoja}
            onChange={e => setSelectedLoja(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 text-sm text-white px-3 py-2 outline-none focus:border-brand-500 max-w-xs"
          >
            <option value="">-- Selecionar loja --</option>
            {filteredLojas.map(l => (
              <option key={l.codigoLoja} value={l.codigoLoja}>
                {l.codigoLoja} — {l.nomeLoja.replace(' (Projeto Olimpo)', '').slice(0, 30)}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {(Object.entries(SHEET_LABELS) as [SheetKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveSheet(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeSheet === key
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {selectedLoja && lojaInspecionada && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-x-auto">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-semibold text-white">
                {lojaInspecionada.codigoLoja} — {lojaInspecionada.nomeLoja.replace(' (Projeto Olimpo)', '')}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Aba: <span className="text-brand-400">{SHEET_LABELS[activeSheet]}</span>
                {rawInspecionada
                  ? ` · ${rawInspecionada.values.length} colunas lidas`
                  : ' · Loja não encontrada nesta aba'}
              </p>
            </div>

            {rawInspecionada ? (
              <table className="w-full text-xs">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-slate-400 font-medium w-8">#</th>
                    <th className="px-3 py-2 text-left text-slate-400 font-medium">Cabeçalho (Linha 1)</th>
                    <th className="px-3 py-2 text-left text-slate-400 font-medium">Cabeçalho (Linha 2)</th>
                    <th className="px-3 py-2 text-left text-slate-500 font-medium">Valor Bruto da Planilha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {rawInspecionada.values.map((cell, i) => {
                    const h1 = headersInspecionados[0]?.[i] ?? ''
                    const h2 = headersInspecionados[1]?.[i] ?? ''
                    const hasValue = cell !== '' && cell !== null && cell !== undefined
                    return (
                      <tr key={i} className={`hover:bg-slate-700/20 ${!hasValue ? 'opacity-40' : ''}`}>
                        <td className="px-3 py-1.5 text-slate-600 font-mono">{i}</td>
                        <td className="px-3 py-1.5 text-slate-300 font-medium">{h1}</td>
                        <td className="px-3 py-1.5 text-slate-500">{h2}</td>
                        <td className="px-3 py-1.5 text-amber-300 font-mono">
                          {hasValue ? cell : <span className="text-slate-700 italic">vazio</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <p className="px-4 py-6 text-sm text-slate-500 text-center">
                Esta loja não possui dados na aba <strong className="text-slate-300">{SHEET_LABELS[activeSheet]}</strong>.
              </p>
            )}
          </div>
        )}

        {!selectedLoja && (
          <div className="rounded-xl border border-slate-700 border-dashed p-10 text-center text-slate-600">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Selecione uma loja para ver os dados brutos vs parseados</p>
          </div>
        )}
      </div>
    </div>
  )
}
