export type StatusCor = 'verde' | 'amarelo' | 'vermelho' | 'neutro'
export type StatusLoja = 'Saudável' | 'Atenção' | 'Crítica'

export interface Loja {
  id: string
  codigoLoja: string
  nomeLoja: string
  cidade: string
  uf: string
  diretorDivisional: string
  diretorRegional: string
  gerenteRegional: string
  projetoOlimpo: boolean

  // Faturamento histórico (aba indicadores)
  faturamentoJaneiro: number | null
  faturamentoFevereiro: number | null
  faturamentoMarco: number | null
  faturamentoAbril: number | null
  faturamentoMaio: number | null   // = venda atual
  faturamentoJunho: number | null  // aba vendas anuais col 13

  // Metas e venda atual
  meta: number | null
  venda: number | null
  desvio: number | null
  crescimento: number | null
  participacao: number | null
  ticketMedio: number | null

  // Vendas diárias
  metaDia: number | null
  vendaDia: number | null
  desvioDia: number | null
  crescimentoDia: number | null

  // Vendas acumuladas
  metaAcumulada: number | null
  vendaAcumulada: number | null
  desvioAcumulado: number | null
  crescimentoAcumulado: number | null
  participacaoAcumulada: number | null
  ticketMedioDiario: number | null

  // Cancelamento
  cancelamentoTotal: number | null
  cancelamentoCliente: number | null
  cancelamentoLoja: number | null
  cancelamentoEntregador: number | null
  cancelamentoAbril: number | null
  cancelamentoDesvio: number | null
  cancelamentoTotalR: number | null
  cancelamentoClienteR: number | null
  cancelamentoLojaR: number | null
  cancelamentoEntregadorR: number | null

  // Indicadores operacionais
  slaPreparo: number | null
  slaEntrega: number | null
  nsu: number | null
  rupturaItem: number | null
  tempoOnline: number | null

  // Perda de venda
  perdaVendaTotal: number | null
  perdaCancelamento: number | null
  perdaRuptura: number | null
  perdaTempoOnline: number | null

  // Calculado
  scoreSaude: number
  statusLoja: StatusLoja
}

export interface Filtros {
  diretorDivisional: string
  diretorRegional: string
  gerenteRegional: string
  codigoLoja: string
  cidade: string
  uf: string
  statusLoja: string
  indicadorCritico: string
  projetoOlimpo: string
}

export interface ResumoKPIs {
  totalLojas: number
  faturamentoTotal: number
  metaTotal: number
  desvioTotal: number
  desvioPercentual: number
  crescimentoMedio: number
  ticketMedioGeral: number
  cancelamentoMedio: number
  perdaVendaTotal: number
  tempoOnlineMedio: number
  lojasAcimaMeta: number
  lojasBaixoMeta: number
  lojasCriticas: number
}

export type DadosMensais = {
  mes: string
  valor: number | null
}
