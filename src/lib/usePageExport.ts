import type { Loja } from '@/types/dashboard'
import type { ExportColumn, ExportRow } from './exportUtils'

// Definições de exportação por página

export const COLUNAS_IDENTIFICACAO: ExportColumn[] = [
  { key: 'codigoLoja',       label: 'Código',       group: 'Identificação', fmt: 'text' },
  { key: 'nomeLoja',         label: 'Nome',         group: 'Identificação', fmt: 'text' },
  { key: 'cidade',           label: 'Cidade',       group: 'Identificação', fmt: 'text' },
  { key: 'uf',               label: 'UF',           group: 'Identificação', fmt: 'text' },
  { key: 'diretorDivisional',label: 'Dir. Div.',    group: 'Identificação', fmt: 'text' },
  { key: 'diretorRegional',  label: 'Dir. Regional',group: 'Identificação', fmt: 'text' },
  { key: 'gerenteRegional',  label: 'Gerente',      group: 'Identificação', fmt: 'text' },
]

export const COLUNAS_FATURAMENTO: ExportColumn[] = [
  { key: 'faturamentoJaneiro',   label: 'Jan',  group: 'Faturamento Mensal', fmt: 'brl' },
  { key: 'faturamentoFevereiro', label: 'Fev',  group: 'Faturamento Mensal', fmt: 'brl' },
  { key: 'faturamentoMarco',     label: 'Mar',  group: 'Faturamento Mensal', fmt: 'brl' },
  { key: 'faturamentoAbril',     label: 'Abr',  group: 'Faturamento Mensal', fmt: 'brl' },
  { key: 'faturamentoMaio',      label: 'Mai',  group: 'Faturamento Mensal', fmt: 'brl' },
  { key: 'faturamentoJunho',     label: 'Jun',  group: 'Faturamento Mensal', fmt: 'brl' },
]

export const COLUNAS_VENDAS: ExportColumn[] = [
  { key: 'meta',         label: 'Meta',      group: 'Vendas',  fmt: 'brl' },
  { key: 'venda',        label: 'Venda',     group: 'Vendas',  fmt: 'brl' },
  { key: 'desvio',       label: 'Desvio',    group: 'Vendas',  fmt: 'brl' },
  { key: 'crescimento',  label: 'Cresc. %',  group: 'Vendas',  fmt: 'pct' },
  { key: 'participacao', label: 'Partic. %', group: 'Vendas',  fmt: 'pct' },
  { key: 'ticketMedio',  label: 'Ticket',    group: 'Vendas',  fmt: 'brl' },
]

export const COLUNAS_VENDAS_DIA: ExportColumn[] = [
  { key: 'metaDia',         label: 'Meta Dia',      group: 'Vendas Dia', fmt: 'brl' },
  { key: 'vendaDia',        label: 'Venda Dia',     group: 'Vendas Dia', fmt: 'brl' },
  { key: 'desvioDia',       label: 'Desvio Dia',    group: 'Vendas Dia', fmt: 'brl' },
  { key: 'crescimentoDia',  label: 'Cresc. Dia %',  group: 'Vendas Dia', fmt: 'pct' },
  { key: 'metaAcumulada',   label: 'Meta Acum.',    group: 'Vendas Dia', fmt: 'brl' },
  { key: 'vendaAcumulada',  label: 'Venda Acum.',   group: 'Vendas Dia', fmt: 'brl' },
  { key: 'desvioAcumulado', label: 'Desvio Acum.',  group: 'Vendas Dia', fmt: 'brl' },
  { key: 'ticketMedioDiario',label: 'Ticket Dia',   group: 'Vendas Dia', fmt: 'brl' },
]

export const COLUNAS_CANCELAMENTO: ExportColumn[] = [
  { key: 'cancelamentoTotal',      label: 'Cancel. %',         group: 'Cancelamento', fmt: 'pct' },
  { key: 'cancelamentoAbril',      label: 'Cancel. Abril %',   group: 'Cancelamento', fmt: 'pct' },
  { key: 'cancelamentoDesvio',     label: 'Desvio Meta %',     group: 'Cancelamento', fmt: 'pct' },
  { key: 'cancelamentoCliente',    label: 'Cliente %',         group: 'Cancelamento', fmt: 'pct' },
  { key: 'cancelamentoLoja',       label: 'Loja %',            group: 'Cancelamento', fmt: 'pct' },
  { key: 'cancelamentoEntregador', label: 'Entregador %',      group: 'Cancelamento', fmt: 'pct' },
  { key: 'cancelamentoTotalR',     label: 'Total R$',          group: 'Cancelamento', fmt: 'brl' },
  { key: 'cancelamentoClienteR',   label: 'Cliente R$',        group: 'Cancelamento', fmt: 'brl' },
  { key: 'cancelamentoLojaR',      label: 'Loja R$',           group: 'Cancelamento', fmt: 'brl' },
  { key: 'cancelamentoEntregadorR',label: 'Entregador R$',     group: 'Cancelamento', fmt: 'brl' },
]

export const COLUNAS_INDICADORES: ExportColumn[] = [
  { key: 'slaPreparo',  label: 'SLA Preparo %',  group: 'Indicadores', fmt: 'pct' },
  { key: 'slaEntrega',  label: 'SLA Entrega %',  group: 'Indicadores', fmt: 'pct' },
  { key: 'nsu',         label: 'NSU %',          group: 'Indicadores', fmt: 'pct' },
  { key: 'rupturaItem', label: 'Ruptura %',       group: 'Indicadores', fmt: 'pct' },
  { key: 'tempoOnline', label: 'Tempo Online %',  group: 'Indicadores', fmt: 'pct' },
]

export const COLUNAS_PERDA: ExportColumn[] = [
  { key: 'perdaVendaTotal',   label: 'Perda Total',       group: 'Perda de Venda', fmt: 'brl' },
  { key: 'perdaCancelamento', label: 'Perda Cancel.',     group: 'Perda de Venda', fmt: 'brl' },
  { key: 'perdaRuptura',      label: 'Perda Ruptura',     group: 'Perda de Venda', fmt: 'brl' },
  { key: 'perdaTempoOnline',  label: 'Perda Tempo On',    group: 'Perda de Venda', fmt: 'brl' },
]

export const COLUNAS_SCORE: ExportColumn[] = [
  { key: 'scoreSaude', label: 'Score Saúde', group: 'Status', fmt: 'number' },
  { key: 'statusLoja', label: 'Status',      group: 'Status', fmt: 'text'   },
]

// ── Conjuntos por página ──────────────────────────────────────────────────────

export function getExportConfig(page: PageType, lojas: Loja[]) {
  const rows = lojas as unknown as ExportRow[]

  const configs: Record<PageType, { title: string; columns: ExportColumn[]; defaultSelected: string[] }> = {
    tabela: {
      title: 'Tabela Detalhada',
      columns: [
        ...COLUNAS_IDENTIFICACAO,
        ...COLUNAS_FATURAMENTO,
        ...COLUNAS_VENDAS,
        ...COLUNAS_CANCELAMENTO,
        ...COLUNAS_INDICADORES,
        ...COLUNAS_PERDA,
        ...COLUNAS_SCORE,
      ],
      defaultSelected: [
        'codigoLoja', 'nomeLoja', 'uf', 'gerenteRegional',
        'faturamentoJaneiro', 'faturamentoFevereiro', 'faturamentoMarco',
        'faturamentoAbril', 'faturamentoMaio', 'faturamentoJunho',
        'meta', 'venda', 'desvio', 'crescimento', 'ticketMedio',
        'cancelamentoTotal', 'tempoOnline', 'scoreSaude', 'statusLoja',
      ],
    },
    visaoGeral: {
      title: 'Visão Geral',
      columns: [
        ...COLUNAS_IDENTIFICACAO,
        ...COLUNAS_VENDAS,
        ...COLUNAS_SCORE,
      ],
      defaultSelected: [
        'codigoLoja', 'nomeLoja', 'uf', 'gerenteRegional',
        'meta', 'venda', 'desvio', 'crescimento', 'scoreSaude', 'statusLoja',
      ],
    },
    vendas: {
      title: 'Vendas',
      columns: [
        ...COLUNAS_IDENTIFICACAO,
        ...COLUNAS_FATURAMENTO,
        ...COLUNAS_VENDAS,
        ...COLUNAS_VENDAS_DIA,
      ],
      defaultSelected: [
        'codigoLoja', 'nomeLoja', 'uf',
        'faturamentoJaneiro', 'faturamentoFevereiro', 'faturamentoMarco',
        'faturamentoAbril', 'faturamentoMaio', 'faturamentoJunho',
        'meta', 'venda', 'desvio', 'crescimento', 'ticketMedio',
      ],
    },
    ranking: {
      title: 'Ranking de Lojas',
      columns: [
        ...COLUNAS_IDENTIFICACAO,
        ...COLUNAS_VENDAS,
        ...COLUNAS_CANCELAMENTO.slice(0, 3),
        ...COLUNAS_INDICADORES,
        ...COLUNAS_SCORE,
      ],
      defaultSelected: [
        'codigoLoja', 'nomeLoja', 'uf',
        'venda', 'desvio', 'crescimento',
        'cancelamentoTotal', 'tempoOnline', 'slaPreparo',
        'scoreSaude', 'statusLoja',
      ],
    },
    cancelamentos: {
      title: 'Cancelamentos',
      columns: [
        ...COLUNAS_IDENTIFICACAO,
        ...COLUNAS_CANCELAMENTO,
      ],
      defaultSelected: [
        'codigoLoja', 'nomeLoja', 'uf', 'gerenteRegional',
        'cancelamentoTotal', 'cancelamentoAbril', 'cancelamentoDesvio',
        'cancelamentoCliente', 'cancelamentoLoja', 'cancelamentoEntregador',
        'cancelamentoTotalR',
      ],
    },
    indicadores: {
      title: 'Indicadores Operacionais',
      columns: [
        ...COLUNAS_IDENTIFICACAO,
        ...COLUNAS_INDICADORES,
        ...COLUNAS_CANCELAMENTO.slice(0, 3),
        ...COLUNAS_SCORE,
      ],
      defaultSelected: [
        'codigoLoja', 'nomeLoja', 'uf', 'gerenteRegional',
        'cancelamentoTotal', 'slaPreparo', 'nsu', 'rupturaItem',
        'slaEntrega', 'tempoOnline', 'scoreSaude', 'statusLoja',
      ],
    },
    perdaVenda: {
      title: 'Perda de Venda',
      columns: [
        ...COLUNAS_IDENTIFICACAO,
        ...COLUNAS_VENDAS.slice(0, 2),
        ...COLUNAS_PERDA,
        ...COLUNAS_SCORE,
      ],
      defaultSelected: [
        'codigoLoja', 'nomeLoja', 'uf', 'gerenteRegional',
        'venda', 'perdaVendaTotal', 'perdaCancelamento', 'perdaRuptura', 'perdaTempoOnline',
        'scoreSaude', 'statusLoja',
      ],
    },
  }

  const { title, columns, defaultSelected } = configs[page]
  return { title, columns, rows, defaultSelected }
}

export type PageType = 'tabela' | 'visaoGeral' | 'vendas' | 'ranking' | 'cancelamentos' | 'indicadores' | 'perdaVenda'
