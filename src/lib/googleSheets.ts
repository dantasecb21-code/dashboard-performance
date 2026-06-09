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

// Constrói mapa nome→índice a partir da linha de headers
function buildHeaderMap(headers: string[]): HMap {
  const map: HMap = {}
  headers?.forEach((h, i) => { if (h?.trim()) map[h.trim()] = i })
  return map
}

// Retorna célula pelo nome do header (se mapeado) ou pelo índice posicional (fallback)
function col(row: Row, h: HMap, name: string, fallback: number): string {
  const idx = Object.prototype.hasOwnProperty.call(h, name) ? h[name] : fallback
  return row[idx] ?? ''
}

// ── Aba: indicadores ────────────────────────────────────────────────
// Fallback posicional (linha 3 da planilha como referência):
// A=dirDiv B=dirOp C=ger D=cod E=nome F=cidade G=uf
// H=jan(7) I=feb(8) J=skip(9) K=mar(10) L=skip(11) M=abr(12) N=skip(13)
// O=meta(14) P=cresc%(15) Q=vendaAcum(16) R=desvio(17) S=particip%(18) T=ticket(19)
// U=skip(20) V=cancel%(21) W=cancelDesvio%(22) X=perdaCancel(23)
// Y=ruptura%(24) Z=rupturaDesvio%(25) AA=perdaRuptura(26) AB=tempoOff%(27) AC=perdaTOn(28)
function parseIndicadores(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'Loja', 4)?.trim()) return null
  return {
    diretorDivisional: col(row, h, 'Diretor Divisional', 0) || '',
    diretorRegional:   col(row, h, 'Diretor Regional', 1) || '',
    gerenteRegional:   col(row, h, 'Gerente Regional', 2) || '',
    codigoLoja:        col(row, h, 'Código', 3).trim(),
    nomeLoja:          col(row, h, 'Loja', 4).trim(),
    cidade:            col(row, h, 'Cidade', 5).trim(),
    uf:                col(row, h, 'UF', 6).trim(),

    faturamentoJaneiro:   parseBRL(col(row, h, 'Janeiro', 7)),
    faturamentoFevereiro: parseBRL(col(row, h, 'Fevereiro', 8)),
    faturamentoMarco:     parseBRL(col(row, h, 'Março', 10)),
    faturamentoAbril:     parseBRL(col(row, h, 'Abril', 12)),
    meta:        parseBRL(col(row, h, 'Meta', 14)),
    crescimento: parsePct(col(row, h, 'Crescimento', 15)),
    venda:       parseBRL(col(row, h, 'Venda', 16)),
    faturamentoMaio: parseBRL(col(row, h, 'Venda', 16)),
    desvio:      parseBRL(col(row, h, 'Desvio', 17)),
    participacao: parsePct(col(row, h, 'Participação', 18)),
    ticketMedio:  parseBRL(col(row, h, 'Ticket Médio', 19)),

    cancelamentoTotal:  parsePct(col(row, h, 'Cancelamento', 21)),
    cancelamentoDesvio: parsePct(col(row, h, 'Desvio Cancelamento', 22)),
    perdaCancelamento:  parseBRL(col(row, h, 'Perda Cancelamento', 23)),
    rupturaItem:        parsePct(col(row, h, 'Ruptura', 24)),
    perdaRuptura:       parseBRL(col(row, h, 'Perda Ruptura', 26)),
    // Coluna armazena % offline (downtime); uptime = 100 - downtime
    tempoOnline: (() => { const v = parsePct(col(row, h, 'Tempo Offline', 27)); return v !== null ? 100 - v : null })(),
    perdaTempoOnline: parseBRL(col(row, h, 'Perda Offline', 28)),
  }
}

// ── Aba: vendas diarias e mensais ────────────────────────────────────
function parseVendasDiarias(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'Loja', 4)?.trim()) return null
  return {
    codigoLoja: col(row, h, 'Código', 3).trim(),
    metaDia:    parseBRL(col(row, h, 'Meta Dia', 7)),
    vendaDia:   parseBRL(col(row, h, 'Venda Dia', 8)),
    desvioDia:  parseBRL(col(row, h, 'Desvio Dia', 9)),
    crescimentoDia: parsePct(col(row, h, 'Crescimento Dia', 10)),

    metaAcumulada:        parseBRL(col(row, h, 'Meta Acumulada', 12)),
    vendaAcumulada:       parseBRL(col(row, h, 'Venda Acumulada', 13)),
    desvioAcumulado:      parseBRL(col(row, h, 'Desvio Acumulado', 14)),
    crescimentoAcumulado: parsePct(col(row, h, 'Crescimento Acumulado', 15)),
    participacaoAcumulada: parsePct(col(row, h, 'Participação Acumulada', 16)),
    ticketMedioDiario:    parseBRL(col(row, h, 'Ticket Médio', 17)),

    cancelamentoTotal: parsePct(col(row, h, 'Cancelamento', 18)),
    slaEntrega:  parsePct(col(row, h, 'SLA Entrega', 25)),
    slaPreparo:  parsePct(col(row, h, 'SLA Preparo', 26)),
    nsu:         parsePct(col(row, h, 'NSU', 27)),
  }
}

// ── Aba: vendas anuais ───────────────────────────────────────────────
function parseVendasAnuais(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'Código', 3)?.trim()) return null
  return {
    codigoLoja:       col(row, h, 'Código', 3).trim(),
    faturamentoJunho: parseBRL(col(row, h, 'Junho', 13)),
    slaPreparo:       parsePct(col(row, h, 'SLA Preparo', 23)),
    nsu:              parsePct(col(row, h, 'NSU', 24)),
  }
}

// ── Aba: cancelamento ────────────────────────────────────────────────
function parseCancelamento(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'Código', 3)?.trim()) return null
  return {
    codigoLoja:              col(row, h, 'Código', 3).trim(),
    cancelamentoAbril:       parsePct(col(row, h, 'Cancelamento Abril', 9)),
    cancelamentoCliente:     parsePct(col(row, h, 'Cancelamento Cliente', 14)),
    cancelamentoLoja:        parsePct(col(row, h, 'Cancelamento Loja', 17)),
    cancelamentoEntregador:  parsePct(col(row, h, 'Cancelamento Entregador', 20)),
    cancelamentoTotalR:      parseBRL(col(row, h, 'Total R$', 23)),
    cancelamentoClienteR:    parseBRL(col(row, h, 'Cliente R$', 24)),
    cancelamentoLojaR:       parseBRL(col(row, h, 'Loja R$', 25)),
    cancelamentoEntregadorR: parseBRL(col(row, h, 'Entregador R$', 26)),
  }
}

export interface RawSheetInfo {
  name: string
  headerRows: string[][]
  dataRows: { codigoLoja: string; values: string[] }[]
  rowCount: number
  headerMap: HMap   // mapa de headers reconhecidos (linha 3)
}

export interface DebugData {
  updatedAt: string
  rawSheets: Record<'indicadores' | 'vendasDiarias' | 'vendasAnuais' | 'cancelamento', RawSheetInfo>
  lojas: Loja[]
  stats: {
    rowCounts: Record<string, number>
    totalLojas: number
    nullCounts: Record<string, number>
  }
}

export async function fetchDebugData(): Promise<DebugData> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const [indRes, diarRes, anuaisRes, cancelRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A1:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A1:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A1:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A1:AF200" }),
  ])

  function splitSheet(res: typeof indRes, name: string): RawSheetInfo {
    const all = (res.data.values as string[][] | null) ?? []
    const headerRows = all.slice(0, 3)
    const dataRows = all.slice(3).filter(r => r.length >= 5 && String(r[4] ?? '').trim() !== '')
    return {
      name,
      headerRows,
      headerMap: buildHeaderMap(headerRows[2] ?? []),
      dataRows: dataRows.map(r => ({ codigoLoja: String(r[3] ?? '').trim(), values: r })),
      rowCount: dataRows.length,
    }
  }

  const rawSheets = {
    indicadores: splitSheet(indRes, 'indicadores'),
    vendasDiarias: splitSheet(diarRes, 'vendas diarias e mensais'),
    vendasAnuais: splitSheet(anuaisRes, 'vendas anuais'),
    cancelamento: splitSheet(cancelRes, 'cancelamento'),
  }

  const toRow = (r: { values: string[] }) => r.values as Row

  const baseMap = new Map<string, Partial<Loja>>()
  for (const r of rawSheets.indicadores.dataRows) {
    const p = parseIndicadores(toRow(r), rawSheets.indicadores.headerMap)
    if (p?.codigoLoja) baseMap.set(p.codigoLoja, p)
  }
  for (const r of rawSheets.vendasDiarias.dataRows) {
    const p = parseVendasDiarias(toRow(r), rawSheets.vendasDiarias.headerMap)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged = { ...p, ...base }
    if (base.cancelamentoTotal === null || base.cancelamentoTotal === undefined) merged.cancelamentoTotal = p.cancelamentoTotal ?? null
    baseMap.set(p.codigoLoja, merged)
  }
  for (const r of rawSheets.vendasAnuais.dataRows) {
    const p = parseVendasAnuais(toRow(r), rawSheets.vendasAnuais.headerMap)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...p, ...base }
    merged.slaPreparo = base.slaPreparo ?? p.slaPreparo ?? null
    merged.nsu = base.nsu ?? p.nsu ?? null
    merged.faturamentoJunho = p.faturamentoJunho ?? base.faturamentoJunho ?? null
    baseMap.set(p.codigoLoja, merged)
  }
  for (const r of rawSheets.cancelamento.dataRows) {
    const p = parseCancelamento(toRow(r), rawSheets.cancelamento.headerMap)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    baseMap.set(p.codigoLoja, { ...base, ...p })
  }

  const lojas: Loja[] = Array.from(baseMap.values())
    .filter(l => l.codigoLoja && l.nomeLoja)
    .map((l, i) => {
      const perdaTotal = (l.perdaCancelamento ?? 0) + (l.perdaRuptura ?? 0) + (l.perdaTempoOnline ?? 0)
      const base: Loja = {
        id: String(i), codigoLoja: l.codigoLoja ?? '', nomeLoja: l.nomeLoja ?? '',
        cidade: l.cidade ?? '', uf: l.uf ?? '', diretorDivisional: l.diretorDivisional ?? '',
        diretorRegional: l.diretorRegional ?? '', gerenteRegional: l.gerenteRegional ?? '',
        projetoOlimpo: (l.nomeLoja ?? '').toLowerCase().includes('olimpo'),
        faturamentoJaneiro: l.faturamentoJaneiro ?? null, faturamentoFevereiro: l.faturamentoFevereiro ?? null,
        faturamentoMarco: l.faturamentoMarco ?? null, faturamentoAbril: l.faturamentoAbril ?? null,
        faturamentoMaio: l.faturamentoMaio ?? null, faturamentoJunho: l.faturamentoJunho ?? null,
        meta: l.meta ?? null, venda: l.venda ?? null, desvio: l.desvio ?? null,
        crescimento: l.crescimento ?? null, participacao: l.participacao ?? null, ticketMedio: l.ticketMedio ?? null,
        metaDia: l.metaDia ?? null, vendaDia: l.vendaDia ?? null, desvioDia: l.desvioDia ?? null, crescimentoDia: l.crescimentoDia ?? null,
        metaAcumulada: l.metaAcumulada ?? null, vendaAcumulada: l.vendaAcumulada ?? null,
        desvioAcumulado: l.desvioAcumulado ?? null, crescimentoAcumulado: l.crescimentoAcumulado ?? null,
        participacaoAcumulada: l.participacaoAcumulada ?? null, ticketMedioDiario: l.ticketMedioDiario ?? null,
        cancelamentoTotal: l.cancelamentoTotal ?? null, cancelamentoCliente: l.cancelamentoCliente ?? null,
        cancelamentoLoja: l.cancelamentoLoja ?? null, cancelamentoEntregador: l.cancelamentoEntregador ?? null,
        cancelamentoAbril: l.cancelamentoAbril ?? null, cancelamentoDesvio: l.cancelamentoDesvio ?? null,
        cancelamentoTotalR: l.cancelamentoTotalR ?? null, cancelamentoClienteR: l.cancelamentoClienteR ?? null,
        cancelamentoLojaR: l.cancelamentoLojaR ?? null, cancelamentoEntregadorR: l.cancelamentoEntregadorR ?? null,
        slaPreparo: l.slaPreparo ?? null, slaEntrega: l.slaEntrega ?? null,
        nsu: l.nsu ?? null, rupturaItem: l.rupturaItem ?? null, tempoOnline: l.tempoOnline ?? null,
        perdaVendaTotal: perdaTotal > 0 ? perdaTotal : (l.perdaVendaTotal ?? null),
        perdaCancelamento: l.perdaCancelamento ?? null, perdaRuptura: l.perdaRuptura ?? null, perdaTempoOnline: l.perdaTempoOnline ?? null,
        scoreSaude: 0, statusLoja: 'Crítica',
      }
      const score = scoreSaudeLoja(base); base.scoreSaude = score; base.statusLoja = statusLoja(score)
      return base
    })

  const nullCount = (field: keyof Loja) => lojas.filter(l => l[field] === null).length

  return {
    updatedAt: new Date().toISOString(),
    rawSheets,
    lojas,
    stats: {
      rowCounts: {
        indicadores: rawSheets.indicadores.rowCount,
        vendasDiarias: rawSheets.vendasDiarias.rowCount,
        vendasAnuais: rawSheets.vendasAnuais.rowCount,
        cancelamento: rawSheets.cancelamento.rowCount,
      },
      totalLojas: lojas.length,
      nullCounts: {
        meta: nullCount('meta'),
        venda: nullCount('venda'),
        cancelamentoTotal: nullCount('cancelamentoTotal'),
        rupturaItem: nullCount('rupturaItem'),
        tempoOnline: nullCount('tempoOnline'),
        slaPreparo: nullCount('slaPreparo'),
        nsu: nullCount('nsu'),
      },
    },
  }
}

let cache: { lojas: Loja[]; ts: number } = { lojas: [], ts: 0 }
const CACHE_TTL = 5 * 60 * 1000

export async function fetchLojas(): Promise<Loja[]> {
  if (Date.now() - cache.ts < CACHE_TTL && cache.lojas.length > 0) return cache.lojas

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  // A3 = inclui linha 3 (headers renomeados pelo usuário) além dos dados
  const [indRes, diarRes, anuaisRes, cancelRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A3:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A3:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A3:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A3:AF200" }),
  ])

  const getRows = (res: typeof indRes) => (res.data.values as Row[] | null) ?? []

  // Primeira linha de cada range = row 3 da planilha = headers
  const [indHeaders,     ...indRows]     = getRows(indRes)
  const [diarHeaders,    ...diarRows]    = getRows(diarRes)
  const [anuaisHeaders,  ...anuaisRows]  = getRows(anuaisRes)
  const [cancelHeaders,  ...cancelRows]  = getRows(cancelRes)

  const indH     = buildHeaderMap(indHeaders     ?? [])
  const diarH    = buildHeaderMap(diarHeaders    ?? [])
  const anuaisH  = buildHeaderMap(anuaisHeaders  ?? [])
  const cancelH  = buildHeaderMap(cancelHeaders  ?? [])

  // Base: indicadores
  const baseMap = new Map<string, Partial<Loja>>()
  for (const row of indRows) {
    const parsed = parseIndicadores(row, indH)
    if (parsed?.codigoLoja) baseMap.set(parsed.codigoLoja, parsed)
  }

  // Merge vendas diárias — não sobrescreve campos já presentes em indicadores
  for (const row of diarRows) {
    const p = parseVendasDiarias(row, diarH)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged = { ...p, ...base }
    if (base.cancelamentoTotal === null || base.cancelamentoTotal === undefined) {
      merged.cancelamentoTotal = p.cancelamentoTotal ?? null
    }
    baseMap.set(p.codigoLoja, merged)
  }

  // Merge vendas anuais
  for (const row of anuaisRows) {
    const p = parseVendasAnuais(row, anuaisH)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...p, ...base }
    merged.slaPreparo = base.slaPreparo ?? p.slaPreparo ?? null
    merged.nsu = base.nsu ?? p.nsu ?? null
    merged.faturamentoJunho = p.faturamentoJunho ?? base.faturamentoJunho ?? null
    baseMap.set(p.codigoLoja, merged)
  }

  // Merge cancelamento
  for (const row of cancelRows) {
    const p = parseCancelamento(row, cancelH)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    baseMap.set(p.codigoLoja, { ...base, ...p })
  }

  // Montar objetos Loja com defaults
  const lojas: Loja[] = Array.from(baseMap.values())
    .filter(l => l.codigoLoja && l.nomeLoja)
    .map((l, i) => {
      const perdaTotal = (l.perdaCancelamento ?? 0) + (l.perdaRuptura ?? 0) + (l.perdaTempoOnline ?? 0)
      const base: Loja = {
        id: String(i),
        codigoLoja: l.codigoLoja ?? '',
        nomeLoja: l.nomeLoja ?? '',
        cidade: l.cidade ?? '',
        uf: l.uf ?? '',
        diretorDivisional: l.diretorDivisional ?? '',
        diretorRegional: l.diretorRegional ?? '',
        gerenteRegional: l.gerenteRegional ?? '',
        projetoOlimpo: (l.nomeLoja ?? '').toLowerCase().includes('projeto olimpo') ||
                       (l.nomeLoja ?? '').toLowerCase().includes('olimpo'),

        faturamentoJaneiro:  l.faturamentoJaneiro  ?? null,
        faturamentoFevereiro: l.faturamentoFevereiro ?? null,
        faturamentoMarco:    l.faturamentoMarco    ?? null,
        faturamentoAbril:    l.faturamentoAbril    ?? null,
        faturamentoMaio:     l.faturamentoMaio     ?? null,
        faturamentoJunho:    l.faturamentoJunho    ?? null,

        meta: l.meta ?? null,
        venda: l.venda ?? null,
        desvio: l.desvio ?? null,
        crescimento: l.crescimento ?? null,
        participacao: l.participacao ?? null,
        ticketMedio: l.ticketMedio ?? null,

        metaDia: l.metaDia ?? null,
        vendaDia: l.vendaDia ?? null,
        desvioDia: l.desvioDia ?? null,
        crescimentoDia: l.crescimentoDia ?? null,

        metaAcumulada: l.metaAcumulada ?? null,
        vendaAcumulada: l.vendaAcumulada ?? null,
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

        slaPreparo: l.slaPreparo ?? null,
        slaEntrega: l.slaEntrega ?? null,
        nsu: l.nsu ?? null,
        rupturaItem: l.rupturaItem ?? null,
        tempoOnline: l.tempoOnline ?? null,

        perdaVendaTotal: perdaTotal > 0 ? perdaTotal : (l.perdaVendaTotal ?? null),
        perdaCancelamento: l.perdaCancelamento ?? null,
        perdaRuptura: l.perdaRuptura ?? null,
        perdaTempoOnline: l.perdaTempoOnline ?? null,

        scoreSaude: 0,
        statusLoja: 'Crítica',
      }
      const score = scoreSaudeLoja(base)
      base.scoreSaude = score
      base.statusLoja = statusLoja(score)
      return base
    })

  cache = { lojas, ts: Date.now() }
  return lojas
}
