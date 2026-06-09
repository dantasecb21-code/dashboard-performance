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

// ── Aba 4: indicadores ───────────────────────────────────────────────────────
// [0-6] hierarquia: dirDiv, dirReg, gerReg, cod, nome, cidade, uf
// [7]  JAN FATURAMENTO   [8]  FEV FATURAMENTO  [9]  FEV DESEMPENHO
// [10] MAR FATURAMENTO   [11] MAR DESEMPENHO
// [12] ABR FATURAMENTO   [13] ABR DESEMPENHO
// [14] MAI FATURAMENTO   [15] MAI DESEMPENHO
// [16] Meta (JUN)        [17] Venda (JUN)      [18] Desvio vs Meta (JUN)
// [19] % Cresc (JUN)     [20] % Participação   [21] Ticket Medio
// [22] PERDA DE VENDA TOTAL
// [23] CANCELAMENTO TOTAL %  [24] DESVIO META cancel  [25] PERDA VENDA cancel
// [26] RUPTURA ITEM %        [27] DESVIO META ruptura  [28] PERDA VENDA ruptura
// [29] TEMPO ON %            [30] DESVIO META tempo on [31] PERDA VENDA tempo on
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

    faturamentoJaneiro:   parseBRL(row[7]),
    faturamentoFevereiro: parseBRL(row[8]),
    faturamentoMarco:     parseBRL(row[10]),
    faturamentoAbril:     parseBRL(row[12]),
    faturamentoMaio:      parseBRL(row[14]),

    meta:        parseBRL(row[16]),
    venda:       parseBRL(row[17]),
    faturamentoJunho: parseBRL(row[17]),
    desvio:      parseBRL(row[18]),
    crescimento: parsePct(row[19]),
    participacao: parsePct(row[20]),
    ticketMedio:  parseBRL(row[21]),

    perdaVendaTotal:    parseBRL(row[22]),
    cancelamentoTotal:  parsePct(row[23]),
    cancelamentoDesvio: parsePct(row[24]),
    perdaCancelamento:  parseBRL(row[25]),
    rupturaItem:        parsePct(row[26]),
    perdaRuptura:       parseBRL(row[28]),
    tempoOnline:        parsePct(row[29]),  // já é % ON, sem inversão
    perdaTempoOnline:   parseBRL(row[31]),
  }
}

// ── Aba 1: vendas anuais ─────────────────────────────────────────────────────
// [0-6] hierarquia
// [7]  JAN FATURAMENTO   [8]  FEV FATURAMENTO  [9]  FEV DESEMPENHO
// [10] MAR FATURAMENTO   [11] MAR DESEMPENHO
// [12] ABR FATURAMENTO   [13] ABR DESEMPENHO
// [14] MAI FATURAMENTO   [15] MAI DESEMPENHO
// [16] JUN Meta          [17] JUN Venda        [18] JUN Desvio
// [19] JUN % Cresc       [20] JUN % Participação [21] JUN Ticket Medio
// [22] CANCELAMENTO TOTAL %  [23] SLA PREPARO  [24] NSU
// [25] RUPTURA ITEM %        [26] SLA ENTREGA  [27] TEMPO ON %
function parseVendasAnuais(row: Row): Partial<Loja> | null {
  if (!row || !row[3]?.trim()) return null
  return {
    codigoLoja:           (row[3] || '').trim(),

    faturamentoJaneiro:   parseBRL(row[7]),
    faturamentoFevereiro: parseBRL(row[8]),
    faturamentoMarco:     parseBRL(row[10]),
    faturamentoAbril:     parseBRL(row[12]),
    faturamentoMaio:      parseBRL(row[14]),
    meta:                 parseBRL(row[16]),
    venda:                parseBRL(row[17]),
    faturamentoJunho:     parseBRL(row[17]),
    desvio:               parseBRL(row[18]),
    crescimento:          parsePct(row[19]),
    participacao:         parsePct(row[20]),
    ticketMedio:          parseBRL(row[21]),

    cancelamentoTotal: parsePct(row[22]),
    slaPreparo:        parsePct(row[23]),
    nsu:               parsePct(row[24]),
    rupturaItem:       parsePct(row[25]),
    slaEntrega:        parsePct(row[26]),
    tempoOnline:       parsePct(row[27]),
  }
}

// ── Aba 2: vendas diarias e mensais ─────────────────────────────────────────
// [0-6] hierarquia
// DIA:       [7] Meta  [8] Venda  [9] Desvio  [10] % Cresc  [11] % Participação
// ACUMULADO: [12] Meta [13] Venda [14] Desvio [15] % Cresc  [16] % Participação [17] Ticket
// [18] CANCELAMENTO TOTAL Junho  [19] CANCELAMENTO TOTAL Ontem
// [20] Cancel Clientes Ontem     [21] Cancel Loja Ontem  [22] Cancel Entregadores Ontem
// [23] SLA PREPARO Junho         [24] SLA PREPARO Ontem
// [25] NSU Junho                 [26] NSU Ontem
// [27] RUPTURA ITEM Junho        [28] RUPTURA ITEM Ontem
function parseVendasDiarias(row: Row): Partial<Loja> | null {
  if (!row || !row[4]?.trim()) return null
  return {
    codigoLoja:      (row[3] || '').trim(),
    metaDia:         parseBRL(row[7]),
    vendaDia:        parseBRL(row[8]),
    desvioDia:       parseBRL(row[9]),
    crescimentoDia:  parsePct(row[10]),

    metaAcumulada:         parseBRL(row[12]),
    vendaAcumulada:        parseBRL(row[13]),
    desvioAcumulado:       parseBRL(row[14]),
    crescimentoAcumulado:  parsePct(row[15]),
    participacaoAcumulada: parsePct(row[16]),
    ticketMedioDiario:     parseBRL(row[17]),

    cancelamentoTotal: parsePct(row[18]),  // acumulado do mês
    slaPreparo:        parsePct(row[23]),
    nsu:               parsePct(row[25]),
    rupturaItem:       parsePct(row[27]),
  }
}

// ── Aba 3: cancelamento ──────────────────────────────────────────────────────
// [0-6] hierarquia
// Cap/Fat:        [7] Abril  [8] Maio   [9] Desvio
// Total Cancel%:  [10] Abril [11] Maio  [12] Desvio
// Cancel Clientes%:[13] Abril [14] Maio [15] Desvio
// Cancel Loja%:   [16] Abril [17] Maio  [18] Desvio
// Cancel Entregadores%: [19] Abril [20] Maio [21] Desvio
// Total R$:       [22] Abril [23] Maio  [24] Desvio
// Clientes R$:    [25] Abril [26] Maio  [27] Desvio
// Loja R$:        [28] Abril [29] Maio  [30] Desvio
// Entregador R$:  [31] Abril [32] Maio  [33] Desvio
function parseCancelamento(row: Row): Partial<Loja> | null {
  if (!row || !row[3]?.trim()) return null
  return {
    codigoLoja:              (row[3] || '').trim(),
    cancelamentoAbril:       parsePct(row[10]),  // total % Abril
    cancelamentoTotal:       parsePct(row[11]),  // total % Maio (mês atual)
    cancelamentoCliente:     parsePct(row[14]),  // Maio
    cancelamentoLoja:        parsePct(row[17]),  // Maio
    cancelamentoEntregador:  parsePct(row[20]),  // Maio
    cancelamentoTotalR:      parseBRL(row[23]),  // Maio
    cancelamentoClienteR:    parseBRL(row[26]),  // Maio
    cancelamentoLojaR:       parseBRL(row[29]),  // Maio
    cancelamentoEntregadorR: parseBRL(row[32]),  // Maio
  }
}

let cache: { lojas: Loja[]; ts: number } = { lojas: [], ts: 0 }
const CACHE_TTL = 5 * 60 * 1000

export async function fetchLojas(): Promise<Loja[]> {
  if (Date.now() - cache.ts < CACHE_TTL && cache.lojas.length > 0) return cache.lojas

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const [anuaisRes, diarRes, cancelRes, indRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A4:AB200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A4:AC200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A4:AH200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A4:AF200" }),
  ])

  const rows = (res: typeof indRes) => (res.data.values as Row[] | null) ?? []

  // Base: indicadores (fonte mais completa — perdas, cancelamentos, KPIs mês atual)
  const baseMap = new Map<string, Partial<Loja>>()
  for (const row of rows(indRes)) {
    const parsed = parseIndicadores(row)
    if (parsed?.codigoLoja) baseMap.set(parsed.codigoLoja, parsed)
  }

  // Vendas anuais — preenche slaEntrega (único lugar) e campos ainda nulos
  for (const row of rows(anuaisRes)) {
    const p = parseVendasAnuais(row)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...p, ...base }  // indicadores tem prioridade
    // slaEntrega só existe aqui
    merged.slaEntrega = base.slaEntrega ?? p.slaEntrega ?? null
    // slaPreparo/nsu/tempoOnline: indicadores não tem, então vendas anuais preenche
    merged.slaPreparo  = base.slaPreparo  ?? p.slaPreparo  ?? null
    merged.nsu         = base.nsu         ?? p.nsu         ?? null
    merged.tempoOnline = base.tempoOnline ?? p.tempoOnline ?? null
    baseMap.set(p.codigoLoja, merged)
  }

  // Vendas diárias — adiciona dados de dia/acumulado; não sobrescreve indicadores
  for (const row of rows(diarRes)) {
    const p = parseVendasDiarias(row)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...p, ...base }  // base tem prioridade
    // cancelamentoTotal de diárias só se não veio de indicadores
    if (base.cancelamentoTotal === null || base.cancelamentoTotal === undefined) {
      merged.cancelamentoTotal = p.cancelamentoTotal ?? null
    }
    // slaPreparo/nsu/rupturaItem de diárias preenchem lacunas
    merged.slaPreparo  = base.slaPreparo  ?? p.slaPreparo  ?? null
    merged.nsu         = base.nsu         ?? p.nsu         ?? null
    merged.rupturaItem = base.rupturaItem ?? p.rupturaItem ?? null
    baseMap.set(p.codigoLoja, merged)
  }

  // Cancelamento — breakdown por responsável e em R$
  for (const row of rows(cancelRes)) {
    const p = parseCancelamento(row)
    if (!p?.codigoLoja) continue
    const base = baseMap.get(p.codigoLoja) ?? {}
    const merged: Partial<Loja> = { ...base, ...p }
    // cancelamentoTotal de cancelamentos só se indicadores não trouxe
    if (base.cancelamentoTotal !== null && base.cancelamentoTotal !== undefined) {
      merged.cancelamentoTotal = base.cancelamentoTotal
    }
    baseMap.set(p.codigoLoja, merged)
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

        faturamentoJaneiro:   l.faturamentoJaneiro   ?? null,
        faturamentoFevereiro: l.faturamentoFevereiro  ?? null,
        faturamentoMarco:     l.faturamentoMarco      ?? null,
        faturamentoAbril:     l.faturamentoAbril      ?? null,
        faturamentoMaio:      l.faturamentoMaio       ?? null,
        faturamentoJunho:     l.faturamentoJunho      ?? null,

        meta:        l.meta        ?? null,
        venda:       l.venda       ?? null,
        desvio:      l.desvio      ?? null,
        crescimento: l.crescimento ?? null,
        participacao: l.participacao ?? null,
        ticketMedio:  l.ticketMedio  ?? null,

        metaDia:        l.metaDia        ?? null,
        vendaDia:       l.vendaDia       ?? null,
        desvioDia:      l.desvioDia      ?? null,
        crescimentoDia: l.crescimentoDia ?? null,

        metaAcumulada:         l.metaAcumulada         ?? null,
        vendaAcumulada:        l.vendaAcumulada         ?? null,
        desvioAcumulado:       l.desvioAcumulado        ?? null,
        crescimentoAcumulado:  l.crescimentoAcumulado   ?? null,
        participacaoAcumulada: l.participacaoAcumulada  ?? null,
        ticketMedioDiario:     l.ticketMedioDiario      ?? null,

        cancelamentoTotal: l.cancelamentoTotal
          ?? (l.cancelamentoCliente !== null && l.cancelamentoLoja !== null && l.cancelamentoEntregador !== null
              ? (l.cancelamentoCliente ?? 0) + (l.cancelamentoLoja ?? 0) + (l.cancelamentoEntregador ?? 0)
              : null),
        cancelamentoCliente:     l.cancelamentoCliente     ?? null,
        cancelamentoLoja:        l.cancelamentoLoja        ?? null,
        cancelamentoEntregador:  l.cancelamentoEntregador  ?? null,
        cancelamentoAbril:       l.cancelamentoAbril       ?? null,
        cancelamentoDesvio:      l.cancelamentoDesvio      ?? null,
        cancelamentoTotalR:      l.cancelamentoTotalR      ?? null,
        cancelamentoClienteR:    l.cancelamentoClienteR    ?? null,
        cancelamentoLojaR:       l.cancelamentoLojaR       ?? null,
        cancelamentoEntregadorR: l.cancelamentoEntregadorR ?? null,

        slaPreparo:  l.slaPreparo  ?? null,
        slaEntrega:  l.slaEntrega  ?? null,
        nsu:         l.nsu         ?? null,
        rupturaItem: l.rupturaItem ?? null,
        tempoOnline: l.tempoOnline ?? null,

        perdaVendaTotal:   l.perdaVendaTotal ?? (perdaTotal > 0 ? perdaTotal : null),
        perdaCancelamento: l.perdaCancelamento ?? null,
        perdaRuptura:      l.perdaRuptura      ?? null,
        perdaTempoOnline:  l.perdaTempoOnline  ?? null,

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
