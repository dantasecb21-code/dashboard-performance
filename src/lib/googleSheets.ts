import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseBRL, parsePct } from './formatters'
import { scoreSaudeLoja, statusLoja } from './calculations'
import type { Loja } from '@/types/dashboard'

const SPREADSHEET_ID = '1mwY0CdPXl4rVtigqu90m4Hu4gyCjO0bBdljl31fxKs0'

function getAuth() {
  const creds = process.env.GOOGLE_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
    : JSON.parse(readFileSync(join(process.cwd(), 'credentials.json'), 'utf8'))
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

type Row = string[]
type HMap = Record<string, number>

function buildHeaderMap(headers: string[]): HMap {
  const map: HMap = {}
  headers?.forEach((h, i) => { if (h?.trim()) map[h.trim()] = i })
  return map
}

function col(row: Row, h: HMap, name: string, fallback: number): string {
  const idx = Object.prototype.hasOwnProperty.call(h, name) ? h[name] : fallback
  return row[idx] ?? ''
}

// Aba 4: indicadores — [16]=meta [17]=venda [18]=desvio [19]=cresc [20]=partic [21]=ticket
// [22]=perdaTotal [23]=cancel% [24]=cancelDesvio [25]=perdaCancel [26]=ruptura%
// [28]=perdaRuptura [29]=tempoOff% (inversão 100-v para obter % ON) [31]=perdaTempoOn
function parseIndicadores(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'nomeLoja', 4)?.trim()) return null
  return {
    diretorDivisional: col(row, h, 'diretorDivisional', 0) || '',
    diretorRegional:   col(row, h, 'diretorRegional', 1) || '',
    gerenteRegional:   col(row, h, 'gerenteRegional', 2) || '',
    codigoLoja:        col(row, h, 'lojaId', 3).trim(),
    nomeLoja:          col(row, h, 'nomeLoja', 4).trim(),
    cidade:            col(row, h, 'cidade', 5).trim(),
    uf:                col(row, h, 'uf', 6).trim(),
    faturamentoJaneiro:   parseBRL(col(row, h, 'janFaturamento', 7)),
    faturamentoFevereiro: parseBRL(col(row, h, 'fevFaturamento', 8)),
    faturamentoMarco:     parseBRL(col(row, h, 'marFaturamento', 10)),
    faturamentoAbril:     parseBRL(col(row, h, 'abrFaturamento', 12)),
    faturamentoMaio:      parseBRL(col(row, h, 'maiFaturamento', 14)),
    meta:         parseBRL(col(row, h, 'junMeta', 16)),
    venda:        parseBRL(col(row, h, 'junVenda', 17)),
    faturamentoJunho: parseBRL(col(row, h, 'junVenda', 17)),
    desvio:       parseBRL(col(row, h, 'junDesvioMeta', 18)),
    crescimento:  parsePct(col(row, h, 'junCrescimento', 19)),
    participacao: parsePct(col(row, h, 'junParticipacao', 20)),
    ticketMedio:  parseBRL(col(row, h, 'ticketMedio', 21)),
    perdaVendaTotal:    parseBRL(col(row, h, 'perdaVendaTotal', 22)),
    cancelamentoTotal:  parsePct(col(row, h, 'cancelamentoTotal', 23)),
    cancelamentoDesvio: parsePct(col(row, h, 'cancelamentoDesvio', 24)),
    perdaCancelamento:  parseBRL(col(row, h, 'perdaCancelamento', 25)),
    rupturaItem:        parsePct(col(row, h, 'rupturaItem', 26)),
    perdaRuptura:       parseBRL(col(row, h, 'perdaRuptura', 28)),
    tempoOnline:        (() => { const v = parsePct(col(row, h, 'tempoOffline', 29)); return v !== null ? 100 - v : null })(),
    perdaTempoOnline:   parseBRL(col(row, h, 'perdaTempoOnline', 31)),
  }
}

// Aba 2: vendas diarias — DIA:[7-10] ACUMULADO:[12-17]
// [18]=cancelJunho [23]=slaPreparoJunho [25]=nsuJunho [27]=rupturaJunho
function parseVendasDiarias(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'nomeLoja', 4)?.trim()) return null
  return {
    codigoLoja:     col(row, h, 'lojaId', 3).trim(),
    metaDia:        parseBRL(col(row, h, 'diaMeta', 7)),
    vendaDia:       parseBRL(col(row, h, 'diaVenda', 8)),
    desvioDia:      parseBRL(col(row, h, 'diaDesvioMeta', 9)),
    crescimentoDia: parsePct(col(row, h, 'diaCrescimento', 10)),
    metaAcumulada:         parseBRL(col(row, h, 'acumuladoMeta', 12)),
    vendaAcumulada:        parseBRL(col(row, h, 'acumuladoVenda', 13)),
    desvioAcumulado:       parseBRL(col(row, h, 'acumuladoDesvioMeta', 14)),
    crescimentoAcumulado:  parsePct(col(row, h, 'acumuladoCrescimento', 15)),
    participacaoAcumulada: parsePct(col(row, h, 'acumuladoParticipacao', 16)),
    ticketMedioDiario:     parseBRL(col(row, h, 'ticketMedio', 17)),
    cancelamentoTotal: parsePct(col(row, h, 'cancelamentoTotalJunho', 18)),
    slaPreparo:        parsePct(col(row, h, 'slaPreparoJunho', 23)),
    nsu:               parsePct(col(row, h, 'nsuJunho', 25)),
    rupturaItem:       parsePct(col(row, h, 'rupturaJunho', 27)),
  }
}

// Aba 1: vendas anuais — fat. JAN-MAI + desempenho JUN + [22]=cancel [23]=slaPreparo
// [24]=nsu [25]=ruptura [26]=slaEntrega [27]=tempoOn%
function parseVendasAnuais(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'lojaId', 3)?.trim()) return null
  return {
    codigoLoja:           col(row, h, 'lojaId', 3).trim(),
    faturamentoJaneiro:   parseBRL(col(row, h, 'janFaturamento', 7)),
    faturamentoFevereiro: parseBRL(col(row, h, 'fevFaturamento', 8)),
    faturamentoMarco:     parseBRL(col(row, h, 'marFaturamento', 10)),
    faturamentoAbril:     parseBRL(col(row, h, 'abrFaturamento', 12)),
    faturamentoMaio:      parseBRL(col(row, h, 'maiFaturamento', 14)),
    meta:                 parseBRL(col(row, h, 'junMeta', 16)),
    venda:                parseBRL(col(row, h, 'junVenda', 17)),
    faturamentoJunho:     parseBRL(col(row, h, 'junVenda', 17)),
    desvio:               parseBRL(col(row, h, 'junDesvio', 18)),
    crescimento:          parsePct(col(row, h, 'junCrescimento', 19)),
    participacao:         parsePct(col(row, h, 'junParticipacao', 20)),
    ticketMedio:          parseBRL(col(row, h, 'junTicket', 21)),
    cancelamentoTotal: parsePct(col(row, h, 'cancelamentoTotal', 22)),
    slaPreparo:        parsePct(col(row, h, 'slaPreparo', 23)),
    nsu:               parsePct(col(row, h, 'nsu', 24)),
    rupturaItem:       parsePct(col(row, h, 'rupturaItem', 25)),
    slaEntrega:        parsePct(col(row, h, 'slaEntrega', 26)),
    tempoOnline:       (() => { const v = parsePct(col(row, h, 'tempoOffline', 27)); return v !== null ? 100 - v : null })(),
  }
}

// Aba 3: cancelamento — dados de Maio (coluna mais recente)
// [10]=totalAbril% [11]=totalMaio% [14]=clienteMaio% [17]=lojaMaio% [20]=entregadorMaio%
// [23]=totalR$Maio [26]=clienteR$Maio [29]=lojaR$Maio [32]=entregadorR$Maio
function parseCancelamento(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'lojaId', 3)?.trim()) return null
  return {
    codigoLoja:              col(row, h, 'lojaId', 3).trim(),
    cancelamentoAbril:       parsePct(col(row, h, 'totalCancelAbril', 10)),
    cancelamentoTotal:       parsePct(col(row, h, 'totalCancelMaio', 11)),
    cancelamentoCliente:     parsePct(col(row, h, 'clientesCancelMaio', 14)),
    cancelamentoLoja:        parsePct(col(row, h, 'lojaCancelMaio', 17)),
    cancelamentoEntregador:  parsePct(col(row, h, 'entregadoresCancelMaio', 20)),
    cancelamentoTotalR:      parseBRL(col(row, h, 'totalRsMaio', 23)),
    cancelamentoClienteR:    parseBRL(col(row, h, 'clientesRsMaio', 26)),
    cancelamentoLojaR:       parseBRL(col(row, h, 'lojaRsMaio', 29)),
    cancelamentoEntregadorR: parseBRL(col(row, h, 'entregadoresRsMaio', 32)),
  }
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

export interface SheetRow { codigoLoja: string; values: string[] }

export interface SheetDebug {
  name: string; headerRows: string[][]; headerMap: HMap
  dataRows: SheetRow[]; rowCount: number
}

export interface DebugData {
  updatedAt: string
  rawSheets: { indicadores: SheetDebug; vendasDiarias: SheetDebug; vendasAnuais: SheetDebug; cancelamento: SheetDebug }
  lojas: Loja[]
  stats: { rowCounts: Record<string, number>; totalLojas: number; nullCounts: Record<string, number> }
}

// ── Cache e funções exportadas ────────────────────────────────────────────────

let cache: { lojas: Loja[]; ts: number } = { lojas: [], ts: 0 }
const CACHE_TTL = 5 * 60 * 1000

async function fetchAllSheets() {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const [anuaisRes, diarRes, cancelRes, indRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A3:AB200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A3:AC200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A3:AH200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A3:AF200" }),
  ])
  const getRows = (res: typeof indRes) => (res.data.values as Row[] | null) ?? []
  return {
    indRows:    getRows(indRes),
    anuaisRows: getRows(anuaisRes),
    diarRows:   getRows(diarRes),
    cancelRows: getRows(cancelRes),
  }
}

function buildLojas(indRows: Row[], anuaisRows: Row[], diarRows: Row[], cancelRows: Row[]): Loja[] {
  const indH    = buildHeaderMap(indRows[0]    ?? [])
  const anuaisH = buildHeaderMap(anuaisRows[0] ?? [])
  const diarH   = buildHeaderMap(diarRows[0]   ?? [])
  const cancelH = buildHeaderMap(cancelRows[0] ?? [])

  const baseMap = new Map<string, Partial<Loja>>()

  for (const row of indRows.slice(1)) {
    const p = parseIndicadores(row, indH)
    if (p?.codigoLoja) baseMap.set(p.codigoLoja, p)
  }

  for (const row of anuaisRows.slice(1)) {
    const p = parseVendasAnuais(row, anuaisH)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...p, ...base }
    merged.slaEntrega  = base.slaEntrega  ?? p.slaEntrega  ?? null
    merged.slaPreparo  = base.slaPreparo  ?? p.slaPreparo  ?? null
    merged.nsu         = base.nsu         ?? p.nsu         ?? null
    merged.tempoOnline = base.tempoOnline ?? p.tempoOnline ?? null
    baseMap.set(p.codigoLoja, merged)
  }

  for (const row of diarRows.slice(1)) {
    const p = parseVendasDiarias(row, diarH)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...p, ...base }
    if (base.cancelamentoTotal === null || base.cancelamentoTotal === undefined)
      merged.cancelamentoTotal = p.cancelamentoTotal ?? null
    merged.slaPreparo  = base.slaPreparo  ?? p.slaPreparo  ?? null
    merged.nsu         = base.nsu         ?? p.nsu         ?? null
    merged.rupturaItem = base.rupturaItem ?? p.rupturaItem ?? null
    baseMap.set(p.codigoLoja, merged)
  }

  for (const row of cancelRows.slice(1)) {
    const p = parseCancelamento(row, cancelH)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...base, ...p }
    if (base.cancelamentoTotal !== null && base.cancelamentoTotal !== undefined)
      merged.cancelamentoTotal = base.cancelamentoTotal
    baseMap.set(p.codigoLoja, merged)
  }

  return Array.from(baseMap.values())
    .filter(l => l.codigoLoja && l.nomeLoja)
    .map((l, i) => {
      const perdaTotal = (l.perdaCancelamento ?? 0) + (l.perdaRuptura ?? 0) + (l.perdaTempoOnline ?? 0)
      const base: Loja = {
        id: String(i), codigoLoja: l.codigoLoja ?? '', nomeLoja: l.nomeLoja ?? '',
        cidade: l.cidade ?? '', uf: l.uf ?? '',
        diretorDivisional: l.diretorDivisional ?? '', diretorRegional: l.diretorRegional ?? '',
        gerenteRegional: l.gerenteRegional ?? '',
        projetoOlimpo: (l.nomeLoja ?? '').toLowerCase().includes('olimpo'),
        faturamentoJaneiro:   l.faturamentoJaneiro   ?? null,
        faturamentoFevereiro: l.faturamentoFevereiro  ?? null,
        faturamentoMarco:     l.faturamentoMarco      ?? null,
        faturamentoAbril:     l.faturamentoAbril      ?? null,
        faturamentoMaio:      l.faturamentoMaio       ?? null,
        faturamentoJunho:     l.faturamentoJunho      ?? null,
        meta: l.meta ?? null, venda: l.venda ?? null, desvio: l.desvio ?? null,
        crescimento: l.crescimento ?? null, participacao: l.participacao ?? null,
        ticketMedio: l.ticketMedio ?? null,
        metaDia: l.metaDia ?? null, vendaDia: l.vendaDia ?? null,
        desvioDia: l.desvioDia ?? null, crescimentoDia: l.crescimentoDia ?? null,
        metaAcumulada: l.metaAcumulada ?? null, vendaAcumulada: l.vendaAcumulada ?? null,
        desvioAcumulado: l.desvioAcumulado ?? null,
        crescimentoAcumulado: l.crescimentoAcumulado ?? null,
        participacaoAcumulada: l.participacaoAcumulada ?? null,
        ticketMedioDiario: l.ticketMedioDiario ?? null,
        cancelamentoTotal: l.cancelamentoTotal
          ?? (l.cancelamentoCliente !== null && l.cancelamentoLoja !== null && l.cancelamentoEntregador !== null
              ? (l.cancelamentoCliente ?? 0) + (l.cancelamentoLoja ?? 0) + (l.cancelamentoEntregador ?? 0)
              : null),
        cancelamentoCliente: l.cancelamentoCliente ?? null,
        cancelamentoLoja: l.cancelamentoLoja ?? null,
        cancelamentoEntregador: l.cancelamentoEntregador ?? null,
        cancelamentoAbril: l.cancelamentoAbril ?? null,
        cancelamentoDesvio: l.cancelamentoDesvio ?? null,
        cancelamentoTotalR: l.cancelamentoTotalR ?? null,
        cancelamentoClienteR: l.cancelamentoClienteR ?? null,
        cancelamentoLojaR: l.cancelamentoLojaR ?? null,
        cancelamentoEntregadorR: l.cancelamentoEntregadorR ?? null,
        slaPreparo: l.slaPreparo ?? null, slaEntrega: l.slaEntrega ?? null,
        nsu: l.nsu ?? null, rupturaItem: l.rupturaItem ?? null, tempoOnline: l.tempoOnline ?? null,
        perdaVendaTotal:   l.perdaVendaTotal ?? (perdaTotal > 0 ? perdaTotal : null),
        perdaCancelamento: l.perdaCancelamento ?? null,
        perdaRuptura:      l.perdaRuptura      ?? null,
        perdaTempoOnline:  l.perdaTempoOnline  ?? null,
        scoreSaude: 0, statusLoja: 'Crítica',
      }
      const score = scoreSaudeLoja(base)
      base.scoreSaude = score
      base.statusLoja = statusLoja(score)
      return base
    })
}

export async function fetchLojas(): Promise<Loja[]> {
  if (Date.now() - cache.ts < CACHE_TTL && cache.lojas.length > 0) return cache.lojas
  const { indRows, anuaisRows, diarRows, cancelRows } = await fetchAllSheets()
  const lojas = buildLojas(indRows, anuaisRows, diarRows, cancelRows)
  cache = { lojas, ts: Date.now() }
  return lojas
}

export async function fetchDebugData(): Promise<DebugData> {
  const { indRows, anuaisRows, diarRows, cancelRows } = await fetchAllSheets()
  const lojas = buildLojas(indRows, anuaisRows, diarRows, cancelRows)
  cache = { lojas, ts: Date.now() }

  const toDebug = (name: string, rows: Row[], keyCol = 3): SheetDebug => ({
    name,
    headerRows: rows.slice(0, 1),
    headerMap: buildHeaderMap(rows[0] ?? []),
    dataRows: rows.slice(1).filter(r => r[keyCol]?.trim()).map(r => ({ codigoLoja: (r[keyCol] ?? '').trim(), values: r })),
    rowCount: rows.slice(1).filter(r => r[keyCol]?.trim()).length,
  })

  const nullCounts = Object.fromEntries(
    ['meta', 'venda', 'cancelamentoTotal', 'rupturaItem', 'tempoOnline', 'slaPreparo', 'slaEntrega', 'nsu', 'perdaVendaTotal']
      .map(k => [k, lojas.filter(l => (l as unknown as Record<string, unknown>)[k] === null).length])
  )

  return {
    updatedAt: new Date().toISOString(),
    rawSheets: {
      indicadores:   toDebug('indicadores', indRows),
      vendasDiarias: toDebug('vendas diarias e mensais', diarRows),
      vendasAnuais:  toDebug('vendas anuais', anuaisRows),
      cancelamento:  toDebug('cancelamento', cancelRows),
    },
    lojas,
    stats: {
      rowCounts: { indicadores: indRows.length - 1, vendasDiarias: diarRows.length - 1, vendasAnuais: anuaisRows.length - 1, cancelamento: cancelRows.length - 1 },
      totalLojas: lojas.length,
      nullCounts,
    },
  }
}
