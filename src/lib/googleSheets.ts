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

// ── Aba: indicadores ────────────────────────────────────────────────
// A=dirDiv B=dirOp C=ger D=cod E=nome F=cidade G=uf
// H=jan(7) I=feb(8) J=skip(9) K=mar(10) L=skip(11) M=abr(12) N=skip(13)
// O=meta(14) P=cresc%(15) Q=vendaAcum(16) R=desvio(17) S=particip%(18) T=ticket(19)
// U=skip(20) V=cancel%(21) W=cancelDesvio%(22) X=perdaCancel(23)
// Y=ruptura%(24) Z=rupturaDesvio%(25) AA=perdaRuptura(26) AB=tempoOn%(27) AC=perdaTOn(28)
function parseIndicadores(row: Row): Partial<Loja> | null {
  if (!row || !row[4]?.trim()) return null
  return {
    diretorDivisional: row[0] || '',
    diretorRegional:   row[1] || '',
    gerenteRegional:   row[2] || '',
    codigoLoja:        (row[3] || '').trim(),
    nomeLoja:          (row[4] || '').trim(),
    cidade:            (row[5] || '').trim(),
    uf:                (row[6] || '').trim(),

    faturamentoJaneiro:  parseBRL(row[7]),
    faturamentoFevereiro: parseBRL(row[8]),
    faturamentoMarco:    parseBRL(row[10]),
    faturamentoAbril:    parseBRL(row[12]),
    meta:        parseBRL(row[14]),
    crescimento: parsePct(row[15]),   // col P = crescimento %
    venda:       parseBRL(row[16]),   // col Q = venda acumulada no mês
    faturamentoMaio: parseBRL(row[16]),
    desvio:      parseBRL(row[17]),   // col R = desvio vs meta
    participacao: parsePct(row[18]),
    ticketMedio:  parseBRL(row[19]),

    cancelamentoTotal:  parsePct(row[21]),
    cancelamentoDesvio: parsePct(row[22]),
    perdaCancelamento:  parseBRL(row[23]),
    rupturaItem:        parsePct(row[24]),
    perdaRuptura:       parseBRL(row[26]),
    // Col 27 armazena % downtime (tempo offline); uptime = 100 - downtime
    tempoOnline: (() => { const v = parsePct(row[27]); return v !== null ? 100 - v : null })(),
    perdaTempoOnline: parseBRL(row[28]),
  }
}

// ── Aba: vendas diarias e mensais ────────────────────────────────────
// Estrutura igual ao indicadores nas primeiras 7 colunas
// H=metaDia I=vendaDia J=desvioDia K=crescDia L=participDia
// M=metaAcum N=vendaAcum O=desvioAcum P=crescAcum Q=participAcum R=ticketDiario
// S=cancelMes T=cancelOntem U..X=outros Y=slaPreparoMes Z=slaPreparoOntem AA=nsu
function parseVendasDiarias(row: Row): Partial<Loja> | null {
  if (!row || !row[4]?.trim()) return null
  return {
    codigoLoja: (row[3] || '').trim(),
    metaDia:    parseBRL(row[7]),
    vendaDia:   parseBRL(row[8]),
    desvioDia:  parseBRL(row[9]),
    crescimentoDia: parsePct(row[10]),

    metaAcumulada:        parseBRL(row[12]),
    vendaAcumulada:       parseBRL(row[13]),
    desvioAcumulado:      parseBRL(row[14]),
    crescimentoAcumulado: parsePct(row[15]),
    participacaoAcumulada: parsePct(row[16]),
    ticketMedioDiario:    parseBRL(row[17]),

    cancelamentoTotal: parsePct(row[18]),  // cancelamento acumulado no mês
    slaEntrega:  parsePct(row[25]),
    slaPreparo:  parsePct(row[26]),
    nsu:         parsePct(row[27]),
  }
}

// ── Aba: vendas anuais ───────────────────────────────────────────────
// A-G hierarquia, H=jan I=feb J=mar K=abr L=mai M=metaJun N=vendaJun
// O=desvio P=cresc Q=particip R=ticket ... X=slaPreparo Y=nsu
function parseVendasAnuais(row: Row): Partial<Loja> | null {
  if (!row || !row[3]?.trim()) return null
  return {
    codigoLoja:        (row[3] || '').trim(),
    faturamentoJunho:  parseBRL(row[13]),   // venda junho (quando disponível)
    slaPreparo:        parsePct(row[23]),
    nsu:               parsePct(row[24]),
  }
}

// ── Aba: cancelamento ────────────────────────────────────────────────
// A-G hierarquia
// col 7-9: totais abril, col 10-12: totais maio, col 13: variacao
// col 14: cancelCliente% (maio), col 15: cancelCliente% (abril), col 16: desvio
// col 17: cancelLoja% (maio),    col 18: cancelLoja% (abril),    col 19: desvio
// col 20: cancelEntregador% (maio), col 21: abril, col 22: desvio
// col 23+: valores em R$
function parseCancelamento(row: Row): Partial<Loja> | null {
  if (!row || !row[3]?.trim()) return null
  return {
    codigoLoja:              (row[3] || '').trim(),
    cancelamentoAbril:       parsePct(row[9]),   // % abril total
    cancelamentoCliente:     parsePct(row[14]),
    cancelamentoLoja:        parsePct(row[17]),
    cancelamentoEntregador:  parsePct(row[20]),
    cancelamentoTotalR:      parseBRL(row[23]),
    cancelamentoClienteR:    parseBRL(row[24]),
    cancelamentoLojaR:       parseBRL(row[25]),
    cancelamentoEntregadorR: parseBRL(row[26]),
  }
}

export interface RawSheetInfo {
  name: string
  headerRows: string[][]   // rows 1-3 from the sheet (group headers, sub-headers, etc.)
  dataRows: { codigoLoja: string; values: string[] }[]
  rowCount: number
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

  // Re-run the same merge to get parsed lojas
  const toRow = (r: { values: string[] }) => r.values as Row

  const baseMap = new Map<string, Partial<Loja>>()
  for (const r of rawSheets.indicadores.dataRows) {
    const p = parseIndicadores(toRow(r)); if (p?.codigoLoja) baseMap.set(p.codigoLoja, p)
  }
  for (const r of rawSheets.vendasDiarias.dataRows) {
    const p = parseVendasDiarias(toRow(r)); if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged = { ...p, ...base }
    if (base.cancelamentoTotal === null || base.cancelamentoTotal === undefined) merged.cancelamentoTotal = p.cancelamentoTotal ?? null
    baseMap.set(p.codigoLoja, merged)
  }
  for (const r of rawSheets.vendasAnuais.dataRows) {
    const p = parseVendasAnuais(toRow(r)); if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...p, ...base }
    merged.slaPreparo = base.slaPreparo ?? p.slaPreparo ?? null
    merged.nsu = base.nsu ?? p.nsu ?? null
    merged.faturamentoJunho = p.faturamentoJunho ?? base.faturamentoJunho ?? null
    baseMap.set(p.codigoLoja, merged)
  }
  for (const r of rawSheets.cancelamento.dataRows) {
    const p = parseCancelamento(toRow(r)); if (!p?.codigoLoja) continue
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

  const [indRes, diarRes, anuaisRes, cancelRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A4:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A4:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A4:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A4:AF200" }),
  ])

  const rows = (res: typeof indRes) => (res.data.values as Row[] | null) ?? []

  // Base: indicadores
  const baseMap = new Map<string, Partial<Loja>>()
  for (const row of rows(indRes)) {
    const parsed = parseIndicadores(row)
    if (parsed?.codigoLoja) baseMap.set(parsed.codigoLoja, parsed)
  }

  // Merge vendas diárias — não sobrescreve campos já presentes em indicadores
  for (const row of rows(diarRes)) {
    const p = parseVendasDiarias(row)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged = { ...p, ...base }  // base tem prioridade
    // Exceções: cancelamentoTotal de diárias só se indicadores não trouxe
    if (base.cancelamentoTotal === null || base.cancelamentoTotal === undefined) {
      merged.cancelamentoTotal = p.cancelamentoTotal ?? null
    }
    baseMap.set(p.codigoLoja, merged)
  }

  // Merge vendas anuais
  for (const row of rows(anuaisRes)) {
    const p = parseVendasAnuais(row)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    // Só sobrescreve slaPreparo/nsu se indicadores não trouxe
    const merged: Partial<Loja> = { ...p, ...base }
    merged.slaPreparo = base.slaPreparo ?? p.slaPreparo ?? null
    merged.nsu = base.nsu ?? p.nsu ?? null
    merged.faturamentoJunho = p.faturamentoJunho ?? base.faturamentoJunho ?? null
    baseMap.set(p.codigoLoja, merged)
  }

  // Merge cancelamento
  for (const row of rows(cancelRes)) {
    const p = parseCancelamento(row)
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
