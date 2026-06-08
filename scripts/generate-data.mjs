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

  const [indRes, diarRes, anuaisRes, cancelRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'indicadores'!A4:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas diarias e mensais'!A4:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'vendas anuais'!A4:AE200" }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'cancelamento'!A4:AF200" }),
  ])

  const rows = (res) => res.data.values ?? []
  const baseMap = new Map()

  for (const row of rows(indRes)) {
    if (!row[4]?.trim()) continue
    const cod = (row[3] || '').trim()
    if (!cod) continue
    baseMap.set(cod, {
      codigoLoja: cod,
      nomeLoja: row[4].trim(),
      cidade: (row[5] || '').trim(),
      uf: (row[6] || '').trim(),
      diretorDivisional: row[0] || '',
      diretorRegional: row[1] || '',
      gerenteRegional: row[2] || '',
      faturamentoJaneiro: parseBRL(row[7]),
      faturamentoFevereiro: parseBRL(row[8]),
      faturamentoMarco: parseBRL(row[10]),
      faturamentoAbril: parseBRL(row[12]),
      meta: parseBRL(row[14]),
      crescimento: parsePct(row[15]),
      venda: parseBRL(row[16]),
      faturamentoMaio: parseBRL(row[16]),
      desvio: parseBRL(row[17]),
      participacao: parsePct(row[18]),
      ticketMedio: parseBRL(row[19]),
      cancelamentoTotal: parsePct(row[21]),
      cancelamentoDesvio: parsePct(row[22]),
      perdaCancelamento: parseBRL(row[23]),
      rupturaItem: parsePct(row[24]),
      perdaRuptura: parseBRL(row[26]),
      tempoOnline: (() => { const v = parsePct(row[27]); return v !== null ? 100 - v : null })(),
      perdaTempoOnline: parseBRL(row[28]),
    })
  }

  for (const row of rows(diarRes)) {
    if (!row[4]?.trim()) continue
    const cod = (row[3] || '').trim()
    if (!cod) continue
    const base = baseMap.get(cod) ?? {}
    const p = {
      codigoLoja: cod,
      cancelamentoTotal: parsePct(row[18]),
      metaDia: parseBRL(row[7]),
      vendaDia: parseBRL(row[8]),
      desvioDia: parseBRL(row[9]),
      crescimentoDia: parsePct(row[10]),
      metaAcumulada: parseBRL(row[12]),
      vendaAcumulada: parseBRL(row[13]),
      desvioAcumulado: parseBRL(row[14]),
      crescimentoAcumulado: parsePct(row[15]),
      participacaoAcumulada: parsePct(row[16]),
      ticketMedioDiario: parseBRL(row[17]),
      slaEntrega: parsePct(row[25]),
      slaPreparo: parsePct(row[26]),
      nsu: parsePct(row[27]),
    }
    const merged = { ...p, ...base }
    if (base.cancelamentoTotal === null || base.cancelamentoTotal === undefined)
      merged.cancelamentoTotal = p.cancelamentoTotal ?? null
    baseMap.set(cod, merged)
  }

  for (const row of rows(anuaisRes)) {
    const cod = (row[3] || '').trim()
    if (!cod) continue
    const base = baseMap.get(cod) ?? {}
    baseMap.set(cod, {
      ...base,
      faturamentoJunho: base.faturamentoJunho ?? parseBRL(row[13]),
      slaPreparo: base.slaPreparo ?? parsePct(row[23]),
      nsu: base.nsu ?? parsePct(row[24]),
    })
  }

  for (const row of rows(cancelRes)) {
    const cod = (row[3] || '').trim()
    if (!cod) continue
    const base = baseMap.get(cod) ?? {}
    baseMap.set(cod, {
      ...base,
      cancelamentoAbril: base.cancelamentoAbril ?? parsePct(row[9]),
      cancelamentoCliente: base.cancelamentoCliente ?? parsePct(row[14]),
      cancelamentoLoja: base.cancelamentoLoja ?? parsePct(row[17]),
      cancelamentoEntregador: base.cancelamentoEntregador ?? parsePct(row[20]),
      cancelamentoTotalR: base.cancelamentoTotalR ?? parseBRL(row[23]),
      cancelamentoClienteR: base.cancelamentoClienteR ?? parseBRL(row[24]),
      cancelamentoLojaR: base.cancelamentoLojaR ?? parseBRL(row[25]),
      cancelamentoEntregadorR: base.cancelamentoEntregadorR ?? parseBRL(row[26]),
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
