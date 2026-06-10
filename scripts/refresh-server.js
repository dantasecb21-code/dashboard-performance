const http = require('http')
const { spawn } = require('child_process')
const { copyFileSync } = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const PORT = 3001

let isRunning = false
let lastUpdated = null
let lastError = null
// callbacks aguardando o processo atual terminar
let pending = []

function finalize(err) {
  lastError = err || null
  if (!err) lastUpdated = new Date().toISOString()
  isRunning = false

  const body = JSON.stringify({ status: 'done', lastUpdated, error: lastError })
  pending.forEach(res => {
    try { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(body) } catch (_) {}
  })
  pending = []
}

function startRefresh(res) {
  if (res) pending.push(res)
  if (isRunning) return // já tem processo rodando, res foi adicionado ao pending

  isRunning = true
  console.log('[refresh] Iniciando busca no Google Sheets...')

  const proc = spawn('node', ['scripts/generate-data.mjs'], { cwd: ROOT, stdio: 'inherit' })

  proc.on('close', code => {
    if (code === 0) {
      try {
        copyFileSync(path.join(ROOT, 'public/data.json'), path.join(ROOT, 'out/data.json'))
        console.log('[refresh] data.json atualizado em', new Date().toISOString())
        finalize(null)
      } catch (e) {
        console.error('[refresh] Erro ao copiar arquivo:', e.message)
        finalize(e.message)
      }
    } else {
      console.error('[refresh] generate-data.mjs saiu com código', code)
      finalize(`Processo encerrou com código ${code}`)
    }
  })

  proc.on('error', e => {
    console.error('[refresh] Falha ao iniciar processo:', e.message)
    finalize(e.message)
  })
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  if (req.method === 'POST' && req.url === '/api/refresh') {
    // Se já está rodando, só adiciona ao pending (responde quando terminar)
    startRefresh(res)
    return
  }

  if (req.method === 'GET' && req.url === '/api/refresh-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: isRunning ? 'running' : 'idle', lastUpdated, error: lastError }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[refresh] Servidor rodando em http://127.0.0.1:${PORT}`)
  // Refresh inicial ao subir
  startRefresh(null)
})
