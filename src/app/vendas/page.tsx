'use client'
import { useState, useMemo } from 'react'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import { avg, sum } from '@/lib/calculations'
import { fmtBRL, fmtBRLCompact, fmtPct } from '@/lib/formatters'
import KpiCard from '@/components/cards/KpiCard'
import LineChartRevenue from '@/components/charts/LineChartRevenue'
import BarChartGoalVsSales from '@/components/charts/BarChartGoalVsSales'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'

type Visao = 'diaria' | 'acumulada' | 'anual'

export default function VendasPage() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()
  const [visao, setVisao] = useState<Visao>('acumulada')

  const kpis = useMemo(() => {
    const vendaDia     = sum(lojasFiltered.map(l => l.vendaDia))
    const metaDia      = sum(lojasFiltered.map(l => l.metaDia))
    const vendaAcum    = sum(lojasFiltered.map(l => l.vendaAcumulada ?? l.venda))
    const metaAcum     = sum(lojasFiltered.map(l => l.metaAcumulada ?? l.meta))
    const crescAcum    = avg(lojasFiltered.map(l => l.crescimentoAcumulado ?? l.crescimento))
    const ticketMedio  = avg(lojasFiltered.map(l => l.ticketMedioDiario ?? l.ticketMedio))
    const participacao = avg(lojasFiltered.map(l => l.participacaoAcumulada ?? l.participacao))
    return {
      vendaDia, metaDia, desvioDia: vendaDia - metaDia,
      vendaAcum, metaAcum, desvioAcum: vendaAcum - metaAcum,
      crescAcum: crescAcum ?? 0, ticketMedio: ticketMedio ?? 0, participacao: participacao ?? 0,
    }
  }, [lojasFiltered])

  const evolucaoAnual = useMemo(() => [
    { mes: 'Jan', valor: sum(lojasFiltered.map(l => l.faturamentoJaneiro)) || null },
    { mes: 'Fev', valor: sum(lojasFiltered.map(l => l.faturamentoFevereiro)) || null },
    { mes: 'Mar', valor: sum(lojasFiltered.map(l => l.faturamentoMarco)) || null },
    { mes: 'Abr', valor: sum(lojasFiltered.map(l => l.faturamentoAbril)) || null },
    { mes: 'Mai', valor: sum(lojasFiltered.map(l => l.faturamentoMaio)) || null },
    { mes: 'Jun', valor: sum(lojasFiltered.map(l => l.faturamentoJunho)) || null },
  ].filter(d => d.valor !== null && d.valor > 0), [lojasFiltered])

  const desvioData = useMemo(() =>
    lojasFiltered
      .filter(l => l.desvio !== null)
      .sort((a, b) => (a.desvio ?? 0) - (b.desvio ?? 0))
      .slice(0, 15)
      .map(l => ({
        nome: l.nomeLoja.slice(0, 22),
        valor: l.desvio ?? 0,
        cor: (l.desvio ?? 0) >= 0 ? '#16a34a' : '#dc2626',
      })), [lojasFiltered])

  const crescimentoData = useMemo(() =>
    lojasFiltered
      .filter(l => l.crescimento !== null)
      .sort((a, b) => (b.crescimento ?? 0) - (a.crescimento ?? 0))
      .slice(0, 15)
      .map(l => ({
        nome: l.nomeLoja.slice(0, 22),
        valor: l.crescimento ?? 0,
        cor: (l.crescimento ?? 0) >= 0 ? '#4f6ef7' : '#dc2626',
      })), [lojasFiltered])

  const metaVsVendaDia = useMemo(() =>
    lojasFiltered
      .filter(l => l.metaDia || l.vendaDia)
      .sort((a, b) => (b.vendaDia ?? 0) - (a.vendaDia ?? 0))
      .slice(0, 15)
      .map(l => ({ nome: l.nomeLoja.slice(0, 16), meta: l.metaDia ?? 0, venda: l.vendaDia ?? 0 })),
    [lojasFiltered])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  const TAB_CLS = (v: Visao) =>
    `px-4 py-2 text-sm rounded-lg font-medium transition ${visao === v ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vendas e Metas</h2>
          <p className="text-sm text-gray-500 mt-0.5">{lojasFiltered.length} lojas</p>
        </div>
        <div className="flex gap-2">
          <button className={TAB_CLS('diaria')}    onClick={() => setVisao('diaria')}>Diária</button>
          <button className={TAB_CLS('acumulada')} onClick={() => setVisao('acumulada')}>Acumulada</button>
          <button className={TAB_CLS('anual')}     onClick={() => setVisao('anual')}>Anual</button>
        </div>
      </div>

      {/* KPIs conforme visão */}
      {visao === 'diaria' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard title="Venda do Dia" value={fmtBRL(kpis.vendaDia)} icon="💰" />
          <KpiCard title="Meta do Dia" value={fmtBRL(kpis.metaDia)} icon="🎯" />
          <KpiCard title="Desvio do Dia" value={fmtBRL(kpis.desvioDia)}
            color={kpis.desvioDia >= 0 ? 'green' : 'red'} icon="📊" />
        </div>
      )}

      {visao === 'acumulada' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard title="Venda Acumulada" value={fmtBRL(kpis.vendaAcum)} icon="💰" />
          <KpiCard title="Meta Acumulada" value={fmtBRL(kpis.metaAcum)} icon="🎯" />
          <KpiCard title="Desvio Acumulado" value={fmtBRL(kpis.desvioAcum)}
            color={kpis.desvioAcum >= 0 ? 'green' : 'red'} icon="📊" />
          <KpiCard title="Crescimento Médio" value={fmtPct(kpis.crescAcum)}
            color={kpis.crescAcum >= 0 ? 'green' : 'red'} icon="📈" />
          <KpiCard title="Ticket Médio" value={fmtBRL(kpis.ticketMedio)} icon="🧾" />
          <KpiCard title="Participação Média" value={fmtPct(kpis.participacao)} icon="📌" />
        </div>
      )}

      {visao === 'anual' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard title="Fat. Janeiro" value={fmtBRL(sum(lojasFiltered.map(l => l.faturamentoJaneiro)))} />
          <KpiCard title="Fat. Fevereiro" value={fmtBRL(sum(lojasFiltered.map(l => l.faturamentoFevereiro)))} />
          <KpiCard title="Fat. Março" value={fmtBRL(sum(lojasFiltered.map(l => l.faturamentoMarco)))} />
          <KpiCard title="Fat. Abril" value={fmtBRL(sum(lojasFiltered.map(l => l.faturamentoAbril)))} />
          <KpiCard title="Fat. Maio" value={fmtBRL(sum(lojasFiltered.map(l => l.faturamentoMaio)))} />
        </div>
      )}

      {/* Gráficos */}
      {(visao === 'anual' || visao === 'acumulada') && (
        <LineChartRevenue data={evolucaoAnual} title="Evolução Mensal de Faturamento" />
      )}

      {visao === 'diaria' && (
        <BarChartGoalVsSales data={metaVsVendaDia} title="Meta × Venda do Dia (Top 15)" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChart
          data={desvioData}
          title="Desvio vs Meta por Loja (Top 15)"
          formatter={v => fmtBRLCompact(v)}
          tooltipFormatter={v => fmtBRL(v)}
        />
        <HorizontalBarChart
          data={crescimentoData}
          title="Crescimento por Loja (Top 15)"
          formatter={v => fmtPct(v)}
        />
      </div>
    </div>
  )
}
