import { google } from 'googleapis'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SPREADSHEET_ID = '1mwY0CdPXl4rVtigqu90m4Hu4gyCjO0bBdljl31fxKs0'

function getAuth() {
  const creds = process.env.GOOGLE_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
    : JSON.parse(readFileSync(join(ROOT, 'credentials.json'), 'utf8'))
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

function buildHeaderMap(headers) {
  const map = {}
  headers?.forEach((h, i) => { if (h?.trim()) map[h.trim()] = i })
  return map
}

function col(row, h, name, fallback) {
  const idx = Object.prototype.hasOwnProperty.call(h, name) ? h[name] : fallback
  return row[idx] ?? ''
}

function parseBRL(str) {
  if (!str && str !== 0) return null
  if (typeof str === 'number') return isNaN(str) ? null : str
  const s = String(str).trim()
  if (!s || s === '#DIV/0!' || s === '#N/D' || s === '#VALOR!' || s === ' R$  -   ') return null
  const clean = s.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim()
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function parsePct(str) {
  if (!str && str !== 0) return null
  if (typeof str === 'number') return isNaN(str) ? null : str
  const s = String(str).trim()
  if (!s || s === '#DIV/0!' || s === '#N/D' || s === '#VALOR!') return null
  const clean = s.replace('%', '').replace(',', '.').trim()
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function scoreSaude(l) {
  let score = 0
  if (l.venda !== null && l.meta !== null && l.meta > 0)
    score += Math.min(35, (l.venda / l.meta) * 35)
  if (l.crescimento !== null)
    score += Math.min(20, Math.max(0, 10 + l.crescimento))
  if (l.cancelamentoTotal !== null)
    score += Math.min(15, Math.max(0, 15 - Math.max(0, l.cancelamentoTotal - 5) * 3))
  if (l.rupturaItem !== null)
    score += Math.min(10, Math.max(0, 10 - Math.max(0, l.rupturaItem - 5) * 2))
  if (l.tempoOnline !== null)
    score += Math.min(10, Math.max(0, 10 - Math.max(0, 95 - l.tempoOnline)))
  if (l.ticketMedio !== null && l.ticketMedio > 0) score += 10
  return Math.round(Math.min(100, Math.max(0, score)))
}

function statusLoja(score) {
  if (score >= 80) return 'Saudável'
  if (score >= 60) return 'Atenção'
  return 'Crítica'
}

async function main() {
  console.log('Buscando dados do Google Sheets...')
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  // A3 = inclui linha 3 (headers renomeados) além dos dados
  const [indRes, diarRes, anuaisRes, cancelRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A3:AF200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A3:AC200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A3:AB200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A3:AH200" }),
  ])

  const getRows = (res) => res.data.values ?? []
  const [indHeaders,    ...indRows]    = getRows(indRes)
  const [diarHeaders,   ...diarRows]   = getRows(diarRes)
  const [anuaisHeaders, ...anuaisRows] = getRows(anuaisRes)
  const [cancelHeaders, ...cancelRows] = getRows(cancelRes)

  const indH    = buildHeaderMap(indHeaders    ?? [])
  const diarH   = buildHeaderMap(diarHeaders   ?? [])
  const anuaisH = buildHeaderMap(anuaisHeaders ?? [])
  const cancelH = buildHeaderMap(cancelHeaders ?? [])

  console.log('Headers detectados — indicadores:', Object.keys(indH).length, 'colunas mapeadas')
  console.log('Headers detectados — cancelamento:', Object.keys(cancelH).length, 'colunas mapeadas')

  const baseMap = new Map()

  for (const row of indRows) {
    if (!col(row, indH, 'nomeLoja', 4)?.trim()) continue
    const cod = col(row, indH, 'lojaId', 3).trim()
    if (!cod) continue
    baseMap.set(cod, {
      codigoLoja: cod,
      nomeLoja: col(row, indH, 'nomeLoja', 4).trim(),
      cidade: col(row, indH, 'cidade', 5).trim(),
      uf: col(row, indH, 'uf', 6).trim(),
      diretorDivisional: col(row, indH, 'diretorDivisional', 0) || '',
      diretorRegional: col(row, indH, 'diretorRegional', 1) || '',
      gerenteRegional: col(row, indH, 'gerenteRegional', 2) || '',
      faturamentoJaneiro:   parseBRL(col(row, indH, 'janFaturamento', 7)),
      faturamentoFevereiro: parseBRL(col(row, indH, 'fevFaturamento', 8)),
      faturamentoMarco:     parseBRL(col(row, indH, 'marFaturamento', 10)),
      faturamentoAbril:     parseBRL(col(row, indH, 'abrFaturamento', 12)),
      faturamentoMaio:      parseBRL(col(row, indH, 'maiFaturamento', 14)),
      meta:         parseBRL(col(row, indH, 'junMeta', 16)),
      venda:        parseBRL(col(row, indH, 'junVenda', 17)),
      desvio:       parseBRL(col(row, indH, 'junDesvioMeta', 18)),
      crescimento:  parsePct(col(row, indH, 'junCrescimento', 19)),
      participacao: parsePct(col(row, indH, 'junParticipacao', 20)),
      ticketMedio:  parseBRL(col(row, indH, 'ticketMedio', 21)),
      perdaVendaTotal:    parseBRL(col(row, indH, 'perdaVendaTotal', 22)),
      cancelamentoTotal:  parsePct(col(row, indH, 'cancelamentoTotalMeta5', 23)),
      cancelamentoDesvio: parsePct(col(row, indH, 'cancelamentoDesvioMeta', 24)),
      perdaCancelamento:  parseBRL(col(row, indH, 'cancelamentoPerdaVenda', 25)),
      rupturaItem:        parsePct(col(row, indH, 'rupturaItemMeta5', 26)),
      perdaRuptura:       parseBRL(col(row, indH, 'rupturaPerdaVenda', 28)),
      tempoOnline: parsePct(col(row, indH, 'tempoOnMeta95', 29)),
      perdaTempoOnline: parseBRL(col(row, indH, 'tempoOnPerdaVenda', 31)),
    })
  }

  for (const row of diarRows) {
    if (!col(row, diarH, 'nomeLoja', 4)?.trim()) continue
    const cod = col(row, diarH, 'lojaId', 3).trim()
    if (!cod) continue
    const base = baseMap.get(cod) ?? {}
    const p = {
      codigoLoja: cod,
      cancelamentoTotal:     parsePct(col(row, diarH, 'junhoCancelamentoTotalMeta5', 18)),
      metaDia:               parseBRL(col(row, diarH, 'diaMeta', 7)),
      vendaDia:              parseBRL(col(row, diarH, 'diaVenda', 8)),
      desvioDia:             parseBRL(col(row, diarH, 'diaDesvioMeta', 9)),
      crescimentoDia:        parsePct(col(row, diarH, 'diaCrescimento', 10)),
      metaAcumulada:         parseBRL(col(row, diarH, 'acumuladoMeta', 12)),
      vendaAcumulada:        parseBRL(col(row, diarH, 'acumuladoVenda', 13)),
      desvioAcumulado:       parseBRL(col(row, diarH, 'acumuladoDesvioMeta', 14)),
      crescimentoAcumulado:  parsePct(col(row, diarH, 'acumuladoCrescimento', 15)),
      participacaoAcumulada: parsePct(col(row, diarH, 'acumuladoParticipacao', 16)),
      ticketMedioDiario:     parseBRL(col(row, diarH, 'ticketMedio', 17)),
      slaPreparo:            parsePct(col(row, diarH, 'junhoSlaPreparoMeta85', 23)),
      nsu:                   parsePct(col(row, diarH, 'junhoNsuMeta12', 25)),
      rupturaItem:           parsePct(col(row, diarH, 'junhoRupturaItemMeta5', 27)),
    }
    const merged = { ...p, ...base }
    if (base.cancelamentoTotal === null || base.cancelamentoTotal === undefined)
      merged.cancelamentoTotal = p.cancelamentoTotal ?? null
    baseMap.set(cod, merged)
  }

  for (const row of anuaisRows) {
    const cod = col(row, anuaisH, 'lojaId', 3).trim()
    if (!cod) continue
    const base = baseMap.get(cod) ?? {}
    baseMap.set(cod, {
      ...base,
      faturamentoJunho:  base.faturamentoJunho  ?? parseBRL(col(row, anuaisH, 'junVenda', 17)),
      slaPreparo:        base.slaPreparo         ?? parsePct(col(row, anuaisH, 'slaPreparoMeta85', 23)),
      nsu:               base.nsu                ?? parsePct(col(row, anuaisH, 'nsuMeta12', 24)),
      rupturaItem:       base.rupturaItem         ?? parsePct(col(row, anuaisH, 'rupturaItemMeta5', 25)),
      slaEntrega:        base.slaEntrega          ?? parsePct(col(row, anuaisH, 'slaEntregaMeta85', 26)),
    })
  }

  for (const row of cancelRows) {
    const cod = col(row, cancelH, 'lojaId', 3).trim()
    if (!cod) continue
    const base = baseMap.get(cod) ?? {}
    baseMap.set(cod, {
      ...base,
      cancelamentoCliente:     base.cancelamentoCliente     ?? parsePct(col(row, cancelH, 'canceladosClientesMaio', 14)),
      cancelamentoLoja:        base.cancelamentoLoja         ?? parsePct(col(row, cancelH, 'canceladosLojaMaio', 17)),
      cancelamentoEntregador:  base.cancelamentoEntregador   ?? parsePct(col(row, cancelH, 'canceladosEntregadoresMaio', 20)),
      cancelamentoTotalR:      base.cancelamentoTotalR       ?? parseBRL(col(row, cancelH, 'canceladosTotalReaisMaio', 23)),
      cancelamentoClienteR:    base.cancelamentoClienteR     ?? parseBRL(col(row, cancelH, 'canceladosClientesReaisMaio', 26)),
      cancelamentoLojaR:       base.cancelamentoLojaR        ?? parseBRL(col(row, cancelH, 'canceladosLojaReaisMaio', 29)),
      cancelamentoEntregadorR: base.cancelamentoEntregadorR  ?? parseBRL(col(row, cancelH, 'canceladosEntregadorReaisMaio', 32)),
    })
  }

  const lojas = Array.from(baseMap.values())
    .filter(l => l.codigoLoja && l.nomeLoja)
    .map((l, i) => {
      const perdaTotal = (l.perdaCancelamento ?? 0) + (l.perdaRuptura ?? 0) + (l.perdaTempoOnline ?? 0)
      const cancelTotal = l.cancelamentoTotal
        ?? (l.cancelamentoCliente !== null && l.cancelamentoLoja !== null && l.cancelamentoEntregador !== null
            ? (l.cancelamentoCliente ?? 0) + (l.cancelamentoLoja ?? 0) + (l.cancelamentoEntregador ?? 0)
            : null)
      const base = {
        id: String(i),
        codigoLoja: l.codigoLoja ?? '',
        nomeLoja: l.nomeLoja ?? '',
        cidade: l.cidade ?? '',
        uf: l.uf ?? '',
        diretorDivisional: l.diretorDivisional ?? '',
        diretorRegional: l.diretorRegional ?? '',
        gerenteRegional: l.gerenteRegional ?? '',
        projetoOlimpo: (l.nomeLoja ?? '').toLowerCase().includes('olimpo'),
        faturamentoJaneiro: l.faturamentoJaneiro ?? null,
        faturamentoFevereiro: l.faturamentoFevereiro ?? null,
        faturamentoMarco: l.faturamentoMarco ?? null,
        faturamentoAbril: l.faturamentoAbril ?? null,
        faturamentoMaio: l.faturamentoMaio ?? null,
        faturamentoJunho: l.faturamentoJunho ?? null,
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
        cancelamentoTotal: cancelTotal,
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
      const sc = scoreSaude(base)
      base.scoreSaude = sc
      base.statusLoja = statusLoja(sc)
      return base
    })

  const out = { lojas, updatedAt: new Date().toISOString() }
  mkdirSync(join(ROOT, 'public'), { recursive: true })
  writeFileSync(join(ROOT, 'public', 'data.json'), JSON.stringify(out))
  console.log(`✓ ${lojas.length} lojas salvas em public/data.json`)
}

main().catch(e => { console.error(e); process.exit(1) })
