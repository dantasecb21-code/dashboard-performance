'use client'
import { useMemo } from 'react'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import { sum } from '@/lib/calculations'
import { fmtBRL, fmtBRLCompact, fmtPct } from '@/lib/formatters'
import KpiCard from '@/components/cards/KpiCard'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart'
import BarChartGoalVsSales from '@/components/charts/BarChartGoalVsSales'
import ScatterPlotChart from '@/components/charts/ScatterPlotChart'
import RankingTable from '@/components/tables/RankingTable'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import type { Loja } from '@/types/dashboard'
import { TrendingDown, XCircle, Package, Clock, Store, MapPin, BarChart2, Lightbulb } from 'lucide-react'

type Quadrante = 'Prioridade Máxima' | 'Saudável' | 'Atenção' | 'Baixa Prioridade'

function quadrante(loja: Loja, medVenda: number, medPerda: number): Quadrante {
  const altaVenda = (loja.venda ?? 0) >= medVenda
  const altaPerda = (loja.perdaVendaTotal ?? 0) >= medPerda
  if (altaVenda && altaPerda)  return 'Prioridade Máxima'
  if (altaVenda && !altaPerda) return 'Saudável'
  if (!altaVenda && altaPerda) return 'Atenção'
  return 'Baixa Prioridade'
}

const Q_COLOR: Record<Quadrante, string> = {
  'Prioridade Máxima': 'bg-red-100 border-destructive/30 text-destructive',
  'Saudável':           'bg-success/15 border-success/30 text-success',
  'Atenção':            'bg-warning/15 border-warning/30 text-warning',
  'Baixa Prioridade':   'bg-white/[0.06] border-gray-200 text-muted-foreground',
}

export default function PerdaVendaPage() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()

  const kpis = useMemo(() => {
    const perdaTotal = sum(lojasFiltered.map(l => l.perdaVendaTotal))
    const perdaCancel = sum(lojasFiltered.map(l => l.perdaCancelamento))
    const perdaRup = sum(lojasFiltered.map(l => l.perdaRuptura))
    const perdaTOn = sum(lojasFiltered.map(l => l.perdaTempoOnline))
    const fatTotal = sum(lojasFiltered.map(l => l.venda))
    const maiorLoja = lojasFiltered.sort((a, b) => (b.perdaVendaTotal ?? 0) - (a.perdaVendaTotal ?? 0))[0]
    const porRegiao: Record<string, number> = {}
    lojasFiltered.forEach(l => {
      const r = l.diretorRegional || 'Sem regional'
      porRegiao[r] = (porRegiao[r] ?? 0) + (l.perdaVendaTotal ?? 0)
    })
    const maiorRegiao = Object.entries(porRegiao).sort((a, b) => b[1] - a[1])[0]
    return { perdaTotal, perdaCancel, perdaRup, perdaTOn, fatTotal, maiorLoja, maiorRegiao, porRegiao }
  }, [lojasFiltered])

  const porMotivoData = useMemo(() => [
    { nome: 'Cancelamento', valor: kpis.perdaCancel, cor: '#ef4444' },
    { nome: 'Ruptura',      valor: kpis.perdaRup,    cor: '#f97316' },
    { nome: 'Tempo Online', valor: kpis.perdaTOn,    cor: '#8b5cf6' },
  ].filter(d => d.valor > 0), [kpis])

  const top10Lojas = useMemo(() =>
    lojasFiltered
      .filter(l => l.perdaVendaTotal && l.perdaVendaTotal > 0)
      .sort((a, b) => (b.perdaVendaTotal ?? 0) - (a.perdaVendaTotal ?? 0))
      .slice(0, 10)
      .map(l => ({ nome: l.nomeLoja.slice(0, 22), valor: l.perdaVendaTotal ?? 0, cor: '#ef4444' })),
    [lojasFiltered])

  const top10Regioes = useMemo(() =>
    Object.entries(kpis.porRegiao)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([nome, valor]) => ({ nome, valor, cor: '#f59e0b' })),
    [kpis.porRegiao])

  const matrizData = useMemo(() => {
    const vendas = lojasFiltered.map(l => l.venda ?? 0).filter(v => v > 0)
    const perdas = lojasFiltered.map(l => l.perdaVendaTotal ?? 0).filter(v => v > 0)
    const medVenda = vendas.length ? vendas.reduce((a, b) => a + b) / vendas.length : 0
    const medPerda = perdas.length ? perdas.reduce((a, b) => a + b) / perdas.length : 0
    const por: Record<Quadrante, number> = {
      'Prioridade Máxima': 0, 'Saudável': 0, 'Atenção': 0, 'Baixa Prioridade': 0,
    }
    lojasFiltered.forEach(l => { por[quadrante(l, medVenda, medPerda)]++ })
    return { por, medVenda, medPerda }
  }, [lojasFiltered])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Perda de Venda</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{lojasFiltered.length} lojas</p>
      </div>

      <div className="kpi-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KpiCard title="Perda Total" value={fmtBRL(kpis.perdaTotal)} color="red" icon={TrendingDown}
          tooltip="Receita total estimada perdida, somando cancelamentos + ruptura de itens + períodos offline. É o principal indicador de oportunidade de melhoria." />
        <KpiCard title="Perda por Cancelamento" value={fmtBRL(kpis.perdaCancel)} icon={XCircle}
          tooltip="Parcela da perda total gerada por pedidos cancelados. Reduzir cancelamentos é a forma mais rápida de recuperar receita." />
        <KpiCard title="Perda por Ruptura" value={fmtBRL(kpis.perdaRup)} icon={Package}
          tooltip="Receita perdida por itens do cardápio que estavam indisponíveis. Clientes visualizaram, mas não conseguiram pedir." />
        <KpiCard title="Perda por Tempo Online" value={fmtBRL(kpis.perdaTOn)} icon={Clock}
          tooltip="Receita estimada perdida por períodos em que a loja ficou offline ou pausada no app." />
        <KpiCard title="Maior Loja (Perda)" value={kpis.maiorLoja?.nomeLoja ?? '—'} subtitle={fmtBRL(kpis.maiorLoja?.perdaVendaTotal ?? null)} icon={Store}
          tooltip="A loja com maior valor absoluto de perda de venda no período. Prioridade máxima de intervenção." />
        <KpiCard title="Maior Região (Perda)" value={kpis.maiorRegiao?.[0] ?? '—'} subtitle={fmtBRL(kpis.maiorRegiao?.[1] ?? null)} icon={MapPin}
          tooltip="A região (diretor regional) com maior perda de venda acumulada no período." />
        <KpiCard title="% Perda / Faturamento"
          value={kpis.fatTotal > 0 ? fmtPct((kpis.perdaTotal / kpis.fatTotal) * 100) : '—'}
          color="red" icon={BarChart2}
          tooltip="Percentual que a perda representa sobre o faturamento total. Indica o impacto relativo — 5% significa que 1 em cada 20 reais foi perdido." />
        <KpiCard title="Potencial de Recuperação" value={fmtBRL(kpis.perdaTotal)} subtitle="reduzindo ao mínimo" color="blue" icon={Lightbulb}
          tooltip="Estimativa do quanto poderia ser recuperado em receita se cancelamentos, ruptura e tempo offline fossem reduzidos ao mínimo possível." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChart data={porMotivoData} title="Perda por Motivo" formatter={v => fmtBRLCompact(v)} tooltipFormatter={v => fmtBRL(v)} />
        <HorizontalBarChart data={top10Lojas}    title="Top 10 Lojas — Maior Perda" formatter={v => fmtBRLCompact(v)} tooltipFormatter={v => fmtBRL(v)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChart data={top10Regioes} title="Top 10 Regiões — Maior Perda" formatter={v => fmtBRLCompact(v)} tooltipFormatter={v => fmtBRL(v)} />
        <ScatterPlotChart lojas={lojasFiltered} title="Venda × Perda por Loja" />
      </div>

      {/* Matriz de prioridade */}
      <div className="glass-card rounded-xl border border-white/[0.06] p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground/80 mb-4">Matriz de Prioridade</h3>
        <div className="kpi-grid grid grid-cols-2 gap-3">
          {(Object.entries(matrizData.por) as [Quadrante, number][]).map(([q, count]) => (
            <div key={q} className={`rounded-lg border p-3 ${Q_COLOR[q]}`}>
              <p className="font-semibold text-sm">{q}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
              <p className="text-xs opacity-75">lojas</p>
              <p className="text-xs mt-1 opacity-75">
                {q === 'Prioridade Máxima' && 'Alta venda + alta perda'}
                {q === 'Saudável'           && 'Alta venda + baixa perda'}
                {q === 'Atenção'            && 'Baixa venda + alta perda'}
                {q === 'Baixa Prioridade'   && 'Baixa venda + baixa perda'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
