'use client'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import StoreDetailTable from '@/components/tables/StoreDetailTable'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import EmptyState from '@/components/common/EmptyState'

export default function TabelaPage() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Tabela Detalhada</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Todos os indicadores por loja · ordenável · exportável</p>
      </div>

      {lojasFiltered.length === 0
        ? <EmptyState />
        : <StoreDetailTable lojas={lojasFiltered} />
      }
    </div>
  )
}
