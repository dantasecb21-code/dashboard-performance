export function fmtBRL(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function fmtBRLCompact(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`
  return fmtBRL(v)
}

export function fmtPct(v: number | null | undefined, decimals = 1): string {
  if (v === null || v === undefined) return '—'
  return `${v.toFixed(decimals)}%`
}

export function fmtNum(v: number | null | undefined, decimals = 0): string {
  if (v === null || v === undefined) return '—'
  return v.toLocaleString('pt-BR', { maximumFractionDigits: decimals })
}

// Aceita "R$ 1.234.567,89", "1234567.89" ou número
export function parseBRL(str: unknown): number | null {
  if (str === null || str === undefined) return null
  if (typeof str === 'number') return isNaN(str) ? null : str
  const s = String(str).trim()
  if (!s || s === '#DIV/0!' || s === '#N/D' || s === '#VALOR!' || s === ' R$  -   ') return null
  const clean = s.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim()
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

// Aceita "5%", "0,05", 0.05 ou 5 → retorna número (ex: 5.0, não 0.05)
export function parsePct(str: unknown): number | null {
  if (str === null || str === undefined) return null
  if (typeof str === 'number') return isNaN(str) ? null : str
  const s = String(str).trim()
  if (!s || s === '#DIV/0!' || s === '#N/D' || s === '#VALOR!') return null
  const clean = s.replace('%', '').replace(',', '.').trim()
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}
