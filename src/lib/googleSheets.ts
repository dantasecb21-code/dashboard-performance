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
// Nova estrutura (jun/2026):
// A-G: identificação | H=janFat(7) I=fevFat(8) J=fevDesemp(9)
// K=marFat(10) L=marDesemp(11) M=abrFat(12) N=abrDesemp(13)
// O=maiFat(14) P=maiDesemp(15)
// Q=junMeta(16) R=junVenda(17) S=junDesvio(18) T=junCresc(19) U=junPartic(20) V=ticket(21)
// W=perdaVendaTotal(22) X=cancel%(23) Y=cancelDesvio(24) Z=perdaCancel(25)
// AA=ruptura%(26) AB=rupturaDesvio(27) AC=perdaRuptura(28) AD=tempoOff%(29) AE=tempoOffDesvio(30) AF=perdaTempo(31)
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
    desvio:       parseBRL(col(row, h, 'junDesvioMeta', 18)),
    crescimento:  parsePct(col(row, h, 'junCrescimento', 19)),
    participacao: parsePct(col(row, h, 'junParticipacao', 20)),
    ticketMedio:  parseBRL(col(row, h, 'ticketMedio', 21)),

    perdaVendaTotal:    parseBRL(col(row, h, 'perdaVendaTotal', 22)),
    cancelamentoTotal:  parsePct(col(row, h, 'cancelamentoTotalMeta5', 23)),
    cancelamentoDesvio: parsePct(col(row, h, 'cancelamentoDesvioMeta', 24)),
    perdaCancelamento:  parseBRL(col(row, h, 'cancelamentoPerdaVenda', 25)),
    rupturaItem:        parsePct(col(row, h, 'rupturaItemMeta5', 26)),
    perdaRuptura:       parseBRL(col(row, h, 'rupturaPerdaVenda', 28)),
    tempoOnline: (() => { const v = parsePct(col(row, h, 'tempoOnMeta95', 29)); return v !== null ? 100 - v : null })(),
    perdaTempoOnline:   parseBRL(col(row, h, 'tempoOnPerdaVenda', 31)),
  }
}

// ── Aba: vendas diarias e mensais ────────────────────────────────────
// Nova estrutura: H=diaMeta(7) I=diaVenda(8) J=diaDesvio(9) K=diaCresc(10) L=diaPartic(11)
// M=acumMeta(12) N=acumVenda(13) O=acumDesvio(14) P=acumCresc(15) Q=acumPartic(16) R=ticket(17)
// S=junCancelTotal%(18) T=ontemCancel%(19) U=ontemCancelClientes(20) V=ontemCancelLoja(21) W=ontemCancelEntregador(22)
// X=junSlaPreparo(23) Y=ontemSlaPreparo(24) Z=junNsu(25) AA=ontemNsu(26) AB=junRuptura(27) AC=ontemRuptura(28)
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

    cancelamentoTotal: parsePct(col(row, h, 'junhoCancelamentoTotalMeta5', 18)),
    slaPreparo:        parsePct(col(row, h, 'junhoSlaPreparoMeta85', 23)),
    nsu:               parsePct(col(row, h, 'junhoNsuMeta12', 25)),
    rupturaItem:       parsePct(col(row, h, 'junhoRupturaItemMeta5', 27)),
  }
}

// ── Aba: vendas anuais ───────────────────────────────────────────────
// Nova estrutura: H-P = faturamentos mensais com desempenho intercalado
// Q=junMeta(16) R=junVenda(17) S=junDesvio(18) T=junDesemp(19) U=junPartic(20) V=junTicket(21)
// W=cancel%(22) X=slaPreparo%(23) Y=nsu%(24) Z=ruptura%(25) AA=slaEntrega%(26) AB=tempoOff%(27)
function parseVendasAnuais(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'lojaId', 3)?.trim()) return null
  return {
    codigoLoja:       col(row, h, 'lojaId', 3).trim(),
    faturamentoJunho: parseBRL(col(row, h, 'junVenda', 17)),
    slaPreparo:       parsePct(col(row, h, 'slaPreparoMeta85', 23)),
    nsu:              parsePct(col(row, h, 'nsuMeta12', 24)),
    rupturaItem:      parsePct(col(row, h, 'rupturaItemMeta5', 25)),
    slaEntrega:       parsePct(col(row, h, 'slaEntregaMeta85', 26)),
  }
}

// ── Aba: cancelamento ────────────────────────────────────────────────
// Nova estrutura (usando dados de Maio — coluna mais recente):
// H=capFatAbril(7) I=capFatMaio(8) J=capFatDesvio(9)
// K=pedidosCancelAbril(10) L=pedidosCancelMaio(11) M=pedidosCancelDesvio(12)
// N=clientesAbril%(13) O=clientesMaio%(14) P=clientesDesvio(15)
// Q=lojaAbril%(16) R=lojaMaio%(17) S=lojaDesvio(18)
// T=entregadoresAbril%(19) U=entregadoresMaio%(20) V=entregadoresDesvio(21)
// W=totalReaisAbril(22) X=totalReaisMaio(23) Y=totalReaisDesvio(24)
// Z=clientesReaisAbril(25) AA=clientesReaisMaio(26) AB=clientesReaisDesvio(27)
// AC=lojaReaisAbril(28) AD=lojaReaisMaio(29) AE=lojaReaisDesvio(30)
// AF=entregadorReaisAbril(31) AG=entregadorReaisMaio(32) AH=entregadorReaisDesvio(33)
function parseCancelamento(row: Row, h: HMap = {}): Partial<Loja> | null {
  if (!row || !col(row, h, 'lojaId', 3)?.trim()) return null
  return {
    codigoLoja:              col(row, h, 'lojaId', 3).trim(),
    cancelamentoCliente:     parsePct(col(row, h, 'canceladosClientesMaio', 14)),
    cancelamentoLoja:        parsePct(col(row, h, 'canceladosLojaMaio', 17)),
    cancelamentoEntregador:  parsePct(col(row, h, 'canceladosEntregadoresMaio', 20)),
    cancelamentoTotalR:      parseBRL(col(row, h, 'canceladosTotalReaisMaio', 23)),
    cancelamentoClienteR:    parseBRL(col(row, h, 'canceladosClientesReaisMaio', 26)),
    cancelamentoLojaR:       parseBRL(col(row, h, 'canceladosLojaReaisMaio', 29)),
    cancelamentoEntregadorR: parseBRL(col(row, h, 'canceladosEntregadorReaisMaio', 32)),
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
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A1:AF200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A1:AC200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A1:AB200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A1:AH200" }),
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
    merged.rupturaItem = base.rupturaItem ?? p.rupturaItem ?? null
    merged.slaEntrega = base.slaEntrega ?? p.slaEntrega ?? null
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
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A3:AF200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A3:AC200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A3:AB200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A3:AH200" }),
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
    merged.rupturaItem = base.rupturaItem ?? p.rupturaItem ?? null
    merged.slaEntrega = base.slaEntrega ?? p.slaEntrega ?? null
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
