import * as XLSX from 'xlsx'

export interface ExportColumn {
  key: string
  label: string
  group: string
  fmt?: 'text' | 'brl' | 'pct' | 'number'
}

export type ExportRow = Record<string, string | number | null | undefined>

export interface ExportConfig {
  title: string
  subtitle?: string
  columns: ExportColumn[]
  rows: ExportRow[]
  selectedKeys: string[]
}

// ── Formata valor para exibição ───────────────────────────────────────────────

function fmt(val: string | number | null | undefined, format?: ExportColumn['fmt']): string {
  if (val === null || val === undefined || val === '') return '—'
  if (format === 'brl') return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  if (format === 'pct') return `${Number(val).toFixed(1)}%`
  if (format === 'number') return Number(val).toLocaleString('pt-BR')
  return String(val)
}

// ── Excel (xlsx) ──────────────────────────────────────────────────────────────

export function exportToExcel(config: ExportConfig, filename = 'export') {
  const { title, subtitle, columns, rows, selectedKeys } = config
  const cols = columns.filter(c => selectedKeys.includes(c.key))

  const wb = XLSX.utils.book_new()

  // Dados da planilha
  const wsData: (string | number)[][] = []

  // Cabeçalho informativo
  wsData.push([title])
  if (subtitle) wsData.push([subtitle])
  wsData.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`])
  wsData.push([])

  // Headers das colunas
  wsData.push(cols.map(c => c.label))

  // Linhas de dados
  for (const row of rows) {
    wsData.push(cols.map(c => {
      const v = row[c.key]
      if (v === null || v === undefined) return ''
      if (c.fmt === 'brl' || c.fmt === 'number') return typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, '')) || 0
      if (c.fmt === 'pct') return typeof v === 'number' ? v : Number(String(v).replace('%', '').replace(',', '.')) || 0
      return String(v)
    }))
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Larguras automáticas
  ws['!cols'] = cols.map((c, i) => {
    const maxLen = Math.max(c.label.length, ...wsData.slice(4).map(r => String(r[i] ?? '').length))
    return { wch: Math.min(maxLen + 2, 40) }
  })

  // Mesclar células do título
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: cols.length - 1 } }]

  XLSX.utils.book_append_sheet(wb, ws, 'Dados')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// ── PDF (jsPDF + autoTable) ───────────────────────────────────────────────────

export async function exportToPDF(config: ExportConfig, filename = 'export') {
  const { title, subtitle, columns, rows, selectedKeys } = config
  const cols = columns.filter(c => selectedKeys.includes(c.key))

  // Import dinâmico para evitar SSR
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: cols.length > 8 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()

  // Cabeçalho
  doc.setFillColor(10, 25, 47)
  doc.rect(0, 0, pageW, 22, 'F')

  doc.setTextColor(0, 200, 180)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 10)

  doc.setTextColor(160, 175, 200)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  if (subtitle) doc.text(subtitle, 14, 16)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} · ${rows.length} registros`, pageW - 14, 16, { align: 'right' })

  // Tabela
  autoTable(doc, {
    startY: 26,
    head: [cols.map(c => c.label)],
    body: rows.map(row => cols.map(c => fmt(row[c.key], c.fmt))),
    styles: {
      fontSize: cols.length > 10 ? 6.5 : 8,
      cellPadding: 2,
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: [15, 40, 70],
      textColor: [0, 200, 180],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: cols.reduce((acc, c, i) => {
      if (c.fmt === 'brl' || c.fmt === 'pct' || c.fmt === 'number') {
        acc[i] = { halign: 'right' }
      }
      return acc
    }, {} as Record<number, { halign: 'right' }>),
    didDrawPage: (data) => {
      const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
      doc.setFontSize(7)
      doc.setTextColor(150)
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        pageW / 2, doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      )
    },
  })

  doc.save(`${filename}.pdf`)
}
