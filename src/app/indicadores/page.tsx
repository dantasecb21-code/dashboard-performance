'use client'
import { useMemo } from 'react'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import { avg } from '@/lib/calculations'
import { fmtPct } from '@/lib/formatters'
import KpiCard from '@/components/cards/KpiCard'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart'
import OperationalHeatmap from '@/components/tables/OperationalHeatmap'
import RankingTable from '@/components/tables/RankingTable'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import { statusIndicador } from '@/lib/statusRules'
import type { Loja } from '@/types/dashboard'

export default function IndicadoresPage() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()

  const kpis = useMemo(() => {
    const mk = <K extends keyof Loja>(k: K) => avg(lojasFiltered.map(l => l[k] as number | null))
    return {
      cancelamento: mk('cancelamentoTotal'),
      slaPreparo:   mk('slaPreparo'),
      nsu:          mk('nsu'),
      ruptura:      mk('rupturaItem'),
      slaEntrega:   mk('slaEntrega'),
      tempoOnline:  mk('tempoOnline'),
      foraCancel:   lojasFiltered.filter(l => l.cancelamentoTotal !== null && l.cancelamentoTotal > 5).length,
      foraSlaPreparo: lojasFiltered.filter(l => l.slaPreparo !== null && l.slaPreparo < 85).length,
      foraNsu:      lojasFiltered.filter(l => l.nsu !== null && l.nsu > 12).length,
      foraRuptura:  lojasFiltered.filter(l => l.rupturaItem !== null && l.rupturaItem > 5).length,
      foraSlaEntrega: lojasFiltered.filter(l => l.slaEntrega !== null && l.slaEntrega < 85).length,
      foraTempoOn:  lojasFiltered.filter(l => l.tempoOnline !== null && l.tempoOnline < 95).length,
    }
  }, [lojasFiltered])

  const foraMetaData = useMemo(() => [
    { nome: 'Cancelamento > 5%', valor: kpis.foraCancel, cor: '#ef4444' },
    { nome: 'NSU > 12%',         valor: kpis.foraNsu,    cor: '#f59e0b' },
    { nome: 'Ruptura > 5%',      valor: kpis.foraRuptura, cor: '#f97316' },
    { nome: 'SLA Preparo < 85%', valor: kpis.foraSlaPreparo, cor: '#8b5cf6' },
    { nome: 'SLA Entrega < 85%', valor: kpis.foraSlaEntrega, cor: '#6366f1' },
    { nome: 'Tempo Online < 95%',valor: kpis.foraTempoOn, cor: '#dc2626' },
  ], [kpis])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  const cor = (ind: Parameters<typeof statusIndicador>[0], v: number | null) => {
    const c = statusIndicador(ind, v)
    return { verde: 'green', amarelo: 'yellow', vermelho: 'red', neutro: 'default' }[c] as 'green' | 'yellow' | 'red' | 'default'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Indicadores Operacionais</h2>
        <p className="text-sm text-gray-500 mt-0.5">{lojasFiltered.length} lojas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Cancelamento Médio" value={kpis.cancelamento !== null ? fmtPct(kpis.cancelamento) : '—'}
          subtitle={`${kpis.foraCancel} fora da meta`} color={cor('cancelamento_total', kpis.cancelamento)} icon="❌" size="sm" />
        <KpiCard title="SLA Preparo Médio" value={kpis.slaPreparo !== null ? fmtPct(kpis.slaPreparo) : '—'}
          subtitle={`${kpis.foraSlaPreparo} fora`} color={cor('sla_preparo', kpis.slaPreparo)} icon="⏱️" size="sm" />
        <KpiCard title="NSU Médio" value={kpis.nsu !== null ? fmtPct(kpis.nsu) : '—'}
          subtitle={`${kpis.foraNsu} fora`} color={cor('nsu', kpis.nsu)} icon="📵" size="sm" />
        <KpiCard title="Ruptura Média" value={kpis.ruptura !== null ? fmtPct(kpis.ruptura) : '—'}
          subtitle={`${kpis.foraRuptura} fora`} color={cor('ruptura_item', kpis.ruptura)} icon="📦" size="sm" />
        <KpiCard title="SLA Entrega Médio" value={kpis.slaEntrega !== null ? fmtPct(kpis.slaEntrega) : '—'}
          subtitle={`${kpis.foraSlaEntrega} fora`} color={cor('sla_entrega', kpis.slaEntrega)} icon="🚚" size="sm" />
        <KpiCard title="Tempo Online Médio" value={kpis.tempoOnline !== null ? fmtPct(kpis.tempoOnline) : '—'}
          subtitle={`${kpis.foraTempoOn} fora`} color={cor('tempo_online', kpis.tempoOnline)} icon="🟢" size="sm" />
      </div>

      {/* Gráfico de lojas fora da meta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChart
          data={foraMetaData}
          title="Lojas Fora da Meta por Indicador"
          formatter={v => `${v} lojas`}
        />

        <div className="grid grid-cols-2 gap-3">
          <RankingTable lojas={lojasFiltered} valueKey="cancelamentoTotal"
            formatter={v => fmtPct(v)} title="Pior Cancelamento" max={5} descending />
          <RankingTable lojas={lojasFiltered} valueKey="rupturaItem"
            formatter={v => fmtPct(v)} title="Pior Ruptura" max={5} descending />
          <RankingTable lojas={lojasFiltered} valueKey="nsu"
            formatter={v => fmtPct(v)} title="Pior NSU" max={5} descending />
          <RankingTable lojas={lojasFiltered} valueKey="tempoOnline"
            formatter={v => fmtPct(v)} title="Pior Tempo Online" max={5} descending={false} />
        </div>
      </div>

      {/* Heatmap semáforo */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tabela Semáforo por Loja</h3>
        <OperationalHeatmap lojas={lojasFiltered} />
      </div>
    </div>
  )
}
