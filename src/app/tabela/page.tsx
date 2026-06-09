'use client'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import StoreDetailTable from '@/components/tables/StoreDetailTable'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import EmptyState from '@/components/common/EmptyState'
import ExportMenu from '@/components/common/ExportMenu'
import { getExportConfig } from '@/lib/usePageExport'

export default function TabelaPage() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  const exp = getExportConfig('tabela', lojasFiltered)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tabela Detalhada</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Todos os indicadores por loja · ordenável · exportável</p>
        </div>
        <ExportMenu title={exp.title} columns={exp.columns} rows={exp.rows} defaultSelected={exp.defaultSelected} filename="tabela-detalhada" />
      </div>

      {lojasFiltered.length === 0
        ? <EmptyState />
        : <StoreDetailTable lojas={lojasFiltered} />
      }
    </div>
  )
}
