import type { Loja, StatusLoja, ResumoKPIs } from '@/types/dashboard'

export function calcularDesvio(valor: number | null, meta: number | null): number | null {
  if (valor === null || meta === null) return null
  return valor - meta
}

export function calcularDesvioPercentual(valor: number | null, meta: number | null): number | null {
  if (valor === null || meta === null || meta === 0) return null
  return ((valor - meta) / meta) * 100
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function scoreSaudeLoja(loja: Loja): number {
  let score = 0

  // Venda vs meta (35 pts)
  if (loja.venda !== null && loja.meta !== null && loja.meta > 0) {
    const ratio = loja.venda / loja.meta
    score += clamp(ratio * 35, 0, 35)
  }

  // Crescimento (20 pts) — 0% = 10pts, cada +1% = +1pt, -1% = -1pt
  if (loja.crescimento !== null) {
    score += clamp(10 + loja.crescimento, 0, 20)
  }

  // Cancelamento (15 pts) — <=5% = 15pts, cada 1% acima = -3pts
  if (loja.cancelamentoTotal !== null) {
    const excess = Math.max(0, loja.cancelamentoTotal - 5)
    score += clamp(15 - excess * 3, 0, 15)
  }

  // Ruptura (10 pts)
  if (loja.rupturaItem !== null) {
    const excess = Math.max(0, loja.rupturaItem - 5)
    score += clamp(10 - excess * 2, 0, 10)
  }

  // Tempo online (10 pts) — >=95% = 10pts, cada 1% abaixo = -1pt
  if (loja.tempoOnline !== null) {
    score += clamp(10 - Math.max(0, 95 - loja.tempoOnline), 0, 10)
  }

  // Ticket médio (10 pts) — se existe, 10pts
  if (loja.ticketMedio !== null && loja.ticketMedio > 0) score += 10

  return Math.round(clamp(score, 0, 100))
}

export function statusLoja(score: number): StatusLoja {
  if (score >= 80) return 'Saudável'
  if (score >= 60) return 'Atenção'
  return 'Crítica'
}

export function avg(arr: (number | null)[]): number | null {
  const vals = arr.filter((v): v is number => v !== null && !isNaN(v))
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

export function sum(arr: (number | null)[]): number {
  return arr.filter((v): v is number => v !== null && !isNaN(v)).reduce((a, b) => a + b, 0)
}

export function calcularResumo(lojas: Loja[]): ResumoKPIs {
  const faturamentoTotal = sum(lojas.map(l => l.venda))
  const metaTotal = sum(lojas.map(l => l.meta))
  return {
    totalLojas: lojas.length,
    faturamentoTotal,
    metaTotal,
    desvioTotal: faturamentoTotal - metaTotal,
    desvioPercentual: metaTotal > 0 ? ((faturamentoTotal - metaTotal) / metaTotal) * 100 : 0,
    crescimentoMedio: avg(lojas.map(l => l.crescimento)) ?? 0,
    ticketMedioGeral: avg(lojas.map(l => l.ticketMedio)) ?? 0,
    cancelamentoMedio: avg(lojas.map(l => l.cancelamentoTotal)) ?? 0,
    perdaVendaTotal: sum(lojas.map(l => l.perdaVendaTotal)),
    tempoOnlineMedio: avg(lojas.map(l => l.tempoOnline)) ?? 0,
    lojasAcimaMeta: lojas.filter(l => l.venda !== null && l.meta !== null && l.venda >= l.meta).length,
    lojasBaixoMeta: lojas.filter(l => l.venda !== null && l.meta !== null && l.venda < l.meta).length,
    lojasCriticas: lojas.filter(l => l.statusLoja === 'Crítica').length,
  }
}
