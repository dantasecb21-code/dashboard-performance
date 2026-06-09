'use client'
import { useMemo } from 'react'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import { calcularResumo } from '@/lib/calculations'
import { fmtBRL, fmtPct } from '@/lib/formatters'
import KpiCard from '@/components/cards/KpiCard'
import AlertCard from '@/components/cards/AlertCard'
import LineChartRevenue from '@/components/charts/LineChartRevenue'
import BarChartGoalVsSales from '@/components/charts/BarChartGoalVsSales'
import RankingTable from '@/components/tables/RankingTable'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import {
  DollarSign, Target, BarChart2, TrendingUp,
  Receipt, XCircle, TrendingDown, Wifi,
  CheckCircle, AlertCircle, ShieldAlert,
} from 'lucide-react'

export default function VisaoGeral() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()

  const resumo = useMemo(() => calcularResumo(lojasFiltered), [lojasFiltered])

  const mesAtual = useMemo(() => {
    const meses = [
      { key: 'faturamentoJunho',     label: 'Junho 2025' },
      { key: 'faturamentoMaio',      label: 'Maio 2025' },
      { key: 'faturamentoAbril',     label: 'Abril 2025' },
      { key: 'faturamentoMarco',     label: 'Março 2025' },
      { key: 'faturamentoFevereiro', label: 'Fevereiro 2025' },
      { key: 'faturamentoJaneiro',   label: 'Janeiro 2025' },
    ] as const
    for (const { key, label } of meses) {
      if (lojasFiltered.some(l => (l[key] ?? 0) > 0)) return label
    }
    return 'Período atual'
  }, [lojasFiltered])

  const evolucaoMensal = useMemo(() => {
    const meses = [
      { mes: 'Jan', key: 'faturamentoJaneiro' },
      { mes: 'Fev', key: 'faturamentoFevereiro' },
      { mes: 'Mar', key: 'faturamentoMarco' },
      { mes: 'Abr', key: 'faturamentoAbril' },
      { mes: 'Mai', key: 'faturamentoMaio' },
      { mes: 'Jun', key: 'faturamentoJunho' },
    ] as const
    return meses
      .map(({ mes, key }) => {
        const vals = lojasFiltered.map(l => l[key]).filter((v): v is number => v !== null)
        const total = vals.length ? vals.reduce((a, b) => a + b, 0) : null
        return { mes, valor: total }
      })
      .filter(d => d.valor !== null)
  }, [lojasFiltered])

  const metaVsVendaData = useMemo(() =>
    lojasFiltered
      .filter(l => l.meta !== null || l.venda !== null)
      .sort((a, b) => (b.venda ?? 0) - (a.venda ?? 0))
      .slice(0, 20)
      .map(l => ({ nome: l.nomeLoja.slice(0, 18), meta: l.meta ?? 0, venda: l.venda ?? 0 })),
    [lojasFiltered])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Visão Geral Executiva</h2>
          <p className="text-sm text-slate-400 mt-0.5">{resumo.totalLojas} lojas</p>
        </div>
        <span className="rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 border border-blue-200 flex-shrink-0">
          {mesAtual}
        </span>
      </div>

      {/* KPIs principais */}
      <div className="kpi-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <p className="col-span-full text-xs font-semibold uppercase tracking-widest text-slate-400">
          Faturamento — {mesAtual}
        </p>
        <KpiCard title="Faturamento Acumulado" subtitle={mesAtual} value={fmtBRL(resumo.faturamentoTotal)} icon={DollarSign}
          tooltip={`Soma do faturamento acumulado de todas as lojas em ${mesAtual} (coluna venda/mai da planilha).`} />
        <KpiCard title="Meta Total" value={fmtBRL(resumo.metaTotal)} icon={Target}
          tooltip="Soma das metas mensais de todas as lojas no período selecionado." />
        <KpiCard
          title="Desvio vs Meta"
          value={fmtBRL(resumo.desvioTotal)}
          delta={resumo.desvioPercentual}
          color={resumo.desvioTotal >= 0 ? 'green' : 'red'}
          icon={BarChart2}
          tooltip="Diferença em R$ entre a venda realizada e a meta. Verde = acima da meta, vermelho = abaixo."
        />
        <KpiCard
          title="Crescimento Médio"
          value={fmtPct(resumo.crescimentoMedio)}
          color={resumo.crescimentoMedio >= 0 ? 'green' : 'red'}
          icon={TrendingUp}
          tooltip="Média do crescimento percentual das lojas em relação ao mesmo período do mês anterior."
        />
        <KpiCard title="Ticket Médio" value={fmtBRL(resumo.ticketMedioGeral)} icon={Receipt}
          tooltip="Valor médio por pedido considerando todas as lojas do período selecionado." />

        <p className="col-span-full text-xs font-semibold uppercase tracking-widest text-slate-400 pt-1">
          Qualidade Operacional
        </p>
        <KpiCard
          title="Cancelamento Médio"
          value={fmtPct(resumo.cancelamentoMedio)}
          subtitle="meta ≤ 5%"
          color={resumo.cancelamentoMedio <= 5 ? 'green' : resumo.cancelamentoMedio <= 7 ? 'yellow' : 'red'}
          icon={XCircle}
          tooltip="Taxa média de pedidos cancelados nas lojas. Meta: ≤ 5%. Acima de 7% é crítico — impacta faturamento e reputação no app."
        />
        <KpiCard
          title="Perda de Venda Total"
          value={fmtBRL(resumo.perdaVendaTotal)}
          color="red"
          icon={TrendingDown}
          tooltip="Receita perdida estimada somando cancelamentos + ruptura de itens + tempo em que as lojas ficaram offline."
        />
        <KpiCard
          title="Tempo Online Médio"
          value={fmtPct(resumo.tempoOnlineMedio)}
          subtitle="meta ≥ 95%"
          color={resumo.tempoOnlineMedio >= 95 ? 'green' : resumo.tempoOnlineMedio >= 85 ? 'yellow' : 'red'}
          icon={Wifi}
          tooltip="Percentual médio de tempo em que as lojas ficaram disponíveis no app. Meta: ≥ 95%. Abaixo disso, clientes não encontram a loja e a receita cai."
        />

        <p className="col-span-full text-xs font-semibold uppercase tracking-widest text-slate-400 pt-1">
          Status das Lojas
        </p>
        <KpiCard title="Lojas Acima da Meta" value={resumo.lojasAcimaMeta} color="green" icon={CheckCircle}
          tooltip="Quantidade de lojas que superaram ou igualaram a meta de vendas no período." />
        <KpiCard title="Lojas Abaixo da Meta" value={resumo.lojasBaixoMeta} color="red" icon={AlertCircle}
          tooltip="Quantidade de lojas que não atingiram a meta de vendas. Veja a página Vendas para detalhar." />
        <KpiCard title="Lojas Críticas" value={resumo.lojasCriticas} color="red" icon={ShieldAlert}
          tooltip="Lojas com score de saúde abaixo de 60 pontos (calculado por venda, crescimento, cancelamento, ruptura e tempo online). Necessitam atenção imediata." />
      </div>

      {/* Alerta de lojas críticas */}
      <AlertCard lojas={lojasFiltered} max={8} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineChartRevenue data={evolucaoMensal} title="Evolução Mensal de Faturamento" />
        <BarChartGoalVsSales data={metaVsVendaData} title="Meta × Venda (Top 20 lojas)" />
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankingTable
          lojas={lojasFiltered}
          valueKey="venda"
          formatter={fmtBRL}
          title="Top 10 — Maior Venda Acumulada"
          descending
        />
        <RankingTable
          lojas={lojasFiltered}
          valueKey="desvio"
          formatter={fmtBRL}
          title="Top 10 — Maior Desvio Negativo vs Meta"
          descending={false}
        />
      </div>
    </div>
  )
}
