'use client'
import { useMemo } from 'react'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import { avg, sum } from '@/lib/calculations'
import { fmtBRL, fmtBRLCompact, fmtPct } from '@/lib/formatters'
import KpiCard from '@/components/cards/KpiCard'
import StackedBarChart from '@/components/charts/StackedBarChart'
import DonutChart from '@/components/charts/DonutChart'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart'
import RankingTable from '@/components/tables/RankingTable'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import { statusCancelamento } from '@/lib/statusRules'
import clsx from 'clsx'
import { XCircle, CalendarDays, BarChart2, DollarSign, User, Store, Bike, TrendingUp, TrendingDown } from 'lucide-react'

export default function CancelamentosPage() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()

  const kpis = useMemo(() => {
    const cancelMedio = avg(lojasFiltered.map(l => l.cancelamentoTotal)) ?? 0
    const cancelAbrilMedio = avg(lojasFiltered.map(l => l.cancelamentoAbril)) ?? 0
    return {
      cancelMedio,
      cancelAbrilMedio,
      variacao: cancelMedio - cancelAbrilMedio,
      valorTotal:   sum(lojasFiltered.map(l => l.cancelamentoTotalR)),
      valorCliente: sum(lojasFiltered.map(l => l.cancelamentoClienteR)),
      valorLoja:    sum(lojasFiltered.map(l => l.cancelamentoLojaR)),
      valorEntregador: sum(lojasFiltered.map(l => l.cancelamentoEntregadorR)),
      lojasAumento: lojasFiltered.filter(l =>
        l.cancelamentoTotal !== null && l.cancelamentoAbril !== null &&
        l.cancelamentoTotal > l.cancelamentoAbril).length,
      lojasReducao: lojasFiltered.filter(l =>
        l.cancelamentoTotal !== null && l.cancelamentoAbril !== null &&
        l.cancelamentoTotal < l.cancelamentoAbril).length,
    }
  }, [lojasFiltered])

  const barAbrilMaio = useMemo(() =>
    lojasFiltered
      .filter(l => l.cancelamentoTotal !== null || l.cancelamentoAbril !== null)
      .sort((a, b) => (b.cancelamentoTotal ?? 0) - (a.cancelamentoTotal ?? 0))
      .slice(0, 15)
      .map(l => ({
        nome: l.nomeLoja.slice(0, 18),
        abril: l.cancelamentoAbril ?? 0,
        maio: l.cancelamentoTotal ?? 0,
      })), [lojasFiltered])

  const stackedData = useMemo(() =>
    lojasFiltered
      .filter(l => l.cancelamentoCliente || l.cancelamentoLoja || l.cancelamentoEntregador)
      .sort((a, b) => ((b.cancelamentoCliente ?? 0) + (b.cancelamentoLoja ?? 0) + (b.cancelamentoEntregador ?? 0))
                    - ((a.cancelamentoCliente ?? 0) + (a.cancelamentoLoja ?? 0) + (a.cancelamentoEntregador ?? 0)))
      .slice(0, 12)
      .map(l => ({
        nome: l.nomeLoja.slice(0, 16),
        cliente:     l.cancelamentoCliente ?? 0,
        loja:        l.cancelamentoLoja ?? 0,
        entregador:  l.cancelamentoEntregador ?? 0,
      })), [lojasFiltered])

  const donutData = useMemo(() => {
    const c = sum(lojasFiltered.map(l => l.cancelamentoClienteR))
    const lo = sum(lojasFiltered.map(l => l.cancelamentoLojaR))
    const e = sum(lojasFiltered.map(l => l.cancelamentoEntregadorR))
    const total = c + lo + e
    if (!total) return []
    return [
      { name: 'Cliente',     value: (c / total) * 100,  color: '#4f6ef7' },
      { name: 'Loja',        value: (lo / total) * 100, color: '#f59e0b' },
      { name: 'Entregador',  value: (e / total) * 100,  color: '#ef4444' },
    ]
  }, [lojasFiltered])

  const valorData = useMemo(() =>
    lojasFiltered
      .filter(l => l.cancelamentoTotalR && l.cancelamentoTotalR > 0)
      .sort((a, b) => (b.cancelamentoTotalR ?? 0) - (a.cancelamentoTotalR ?? 0))
      .slice(0, 10)
      .map(l => ({ nome: l.nomeLoja.slice(0, 22), valor: l.cancelamentoTotalR ?? 0, cor: '#ef4444' })),
    [lojasFiltered])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  const cor = statusCancelamento(kpis.cancelMedio)
  const colorMap = { verde: 'green', amarelo: 'yellow', vermelho: 'red', neutro: 'default' } as const

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Cancelamentos</h2>
        <p className="text-sm text-slate-400 mt-0.5">Meta ≤ 5% · {lojasFiltered.length} lojas</p>
      </div>

      <div className="kpi-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KpiCard title="Cancelamento Médio (Maio)" value={fmtPct(kpis.cancelMedio)}
          subtitle="meta ≤ 5%" color={colorMap[cor]} icon={XCircle}
          tooltip="Taxa média de pedidos cancelados no mês de maio. Meta: ≤ 5%. Acima de 7% é considerado crítico pelo app e impacta o ranking das lojas." />
        <KpiCard title="Cancelamento Médio (Abril)" value={fmtPct(kpis.cancelAbrilMedio)} icon={CalendarDays}
          tooltip="Taxa média de cancelamentos no mês de abril, usada como base de comparação com maio." />
        <KpiCard title="Variação Abr × Mai" value={fmtPct(kpis.variacao)}
          color={kpis.variacao <= 0 ? 'green' : 'red'} icon={BarChart2}
          tooltip="Variação percentual entre abril e maio. Negativo (verde) = melhora, positivo (vermelho) = piora." />
        <KpiCard title="Valor Cancelado Total" value={fmtBRL(kpis.valorTotal)} color="red" icon={DollarSign}
          tooltip="Soma em R$ de toda a receita perdida por cancelamentos no período." />
        <KpiCard title="Cancelado por Cliente" value={fmtBRL(kpis.valorCliente)} icon={User}
          tooltip="Valor dos pedidos cancelados por iniciativa do próprio cliente (desistência, demora percebida, etc.)." />
        <KpiCard title="Cancelado pela Loja" value={fmtBRL(kpis.valorLoja)} icon={Store}
          tooltip="Valor dos pedidos cancelados pela loja (estoque esgotado, encerramento antecipado, sobrecarga, etc.). É o tipo mais controlável." />
        <KpiCard title="Cancelado por Entregador" value={fmtBRL(kpis.valorEntregador)} icon={Bike}
          tooltip="Valor dos pedidos cancelados por falha na entrega (entregador não encontrou o endereço, recusou o pedido, etc.)." />
        <KpiCard title="Lojas com Aumento" value={kpis.lojasAumento} color="red" icon={TrendingUp}
          tooltip="Quantidade de lojas cuja taxa de cancelamento aumentou em relação ao mês de abril." />
        <KpiCard title="Lojas com Redução" value={kpis.lojasReducao} color="green" icon={TrendingDown}
          tooltip="Quantidade de lojas que reduziram a taxa de cancelamento em relação ao mês de abril." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StackedBarChart
          data={barAbrilMaio}
          keys={[
            { dataKey: 'abril', name: 'Abril', color: '#93c5fd' },
            { dataKey: 'maio',  name: 'Maio',  color: '#3b82f6' },
          ]}
          title="Cancelamento Abril × Maio (Top 15)"
          formatter={v => fmtPct(v)}
        />
        <DonutChart data={donutData} title="Participação por Origem (R$)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChart
          data={valorData}
          title="Top 10 — Maior Valor Cancelado"
          formatter={v => fmtBRLCompact(v)}
          tooltipFormatter={v => fmtBRL(v)}
        />
        <StackedBarChart
          data={stackedData}
          keys={[
            { dataKey: 'cliente',    name: 'Cliente',    color: '#4f6ef7' },
            { dataKey: 'loja',       name: 'Loja',       color: '#f59e0b' },
            { dataKey: 'entregador', name: 'Entregador', color: '#ef4444' },
          ]}
          title="Cancelamento por Origem (Top 12)"
          formatter={v => fmtPct(v)}
        />
      </div>

      <RankingTable
        lojas={lojasFiltered}
        valueKey="cancelamentoTotal"
        formatter={v => fmtPct(v)}
        title="Ranking — Maior Cancelamento"
        descending
      />
    </div>
  )
}
