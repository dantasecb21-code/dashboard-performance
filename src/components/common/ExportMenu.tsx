'use client'
import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { Download, FileSpreadsheet, FileText, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react'
import type { ExportColumn, ExportRow } from '@/lib/exportUtils'
import { exportToExcel, exportToPDF } from '@/lib/exportUtils'

interface Props {
  title: string
  subtitle?: string
  columns: ExportColumn[]
  rows: ExportRow[]
  filename?: string
  defaultSelected?: string[]
}

// Agrupa colunas por grupo
function groupCols(cols: ExportColumn[]) {
  const map: Record<string, ExportColumn[]> = {}
  for (const c of cols) {
    if (!map[c.group]) map[c.group] = []
    map[c.group].push(c)
  }
  return map
}

export default function ExportMenu({ title, subtitle, columns, rows, filename = 'dashboard', defaultSelected }: Props) {
  const [open, setOpen]         = useState(false)
  const [modal, setModal]       = useState(false)
  const [loading, setLoading]   = useState<'xlsx' | 'pdf' | null>(null)
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelected ?? columns.map(c => c.key))
  )
  const [modalFmt, setModalFmt] = useState<'xlsx' | 'pdf'>('xlsx')
  const triggerRef = useRef<HTMLDivElement>(null)

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const config = () => ({
    title,
    subtitle: subtitle ?? `${rows.length} registros · ${new Date().toLocaleDateString('pt-BR')}`,
    columns,
    rows,
    selectedKeys: [...selected],
  })

  const doExport = async (fmt: 'xlsx' | 'pdf') => {
    setLoading(fmt)
    try {
      if (fmt === 'xlsx') exportToExcel(config(), filename)
      else await exportToPDF(config(), filename)
    } finally {
      setLoading(null)
      setOpen(false)
    }
  }

  const doCustomExport = async () => {
    setLoading(modalFmt)
    try {
      if (modalFmt === 'xlsx') exportToExcel(config(), filename)
      else await exportToPDF(config(), filename)
    } finally {
      setLoading(null)
      setModal(false)
    }
  }

  const toggleCol = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleGroup = (cols: ExportColumn[]) => {
    const allOn = cols.every(c => selected.has(c.key))
    setSelected(prev => {
      const next = new Set(prev)
      cols.forEach(c => allOn ? next.delete(c.key) : next.add(c.key))
      return next
    })
  }

  const groups = groupCols(columns)

  return (
    <>
      {/* ── Botão + dropdown ──────────────────────────────────────────────── */}
      <div ref={triggerRef} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className={clsx(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer',
            open
              ? 'border-brand-500/40 text-brand-400 bg-brand-500/10'
              : 'border-border text-muted-foreground hover:bg-white/[0.04]',
          )}>
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
          <ChevronDown className={clsx('w-3 h-3 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-white/10 bg-[hsl(220_52%_7%)] shadow-[0_20px_50px_-10px_hsl(220_80%_2%/0.85)] backdrop-blur-xl overflow-hidden z-50">
            <div className="p-1">
              <button
                disabled={!!loading}
                onClick={() => doExport('xlsx')}
                className="flex items-center gap-2.5 w-full text-xs rounded-lg px-3 py-2 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition cursor-pointer disabled:opacity-50">
                <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />
                {loading === 'xlsx' ? 'Gerando…' : 'Excel (.xlsx)'}
              </button>
              <button
                disabled={!!loading}
                onClick={() => doExport('pdf')}
                className="flex items-center gap-2.5 w-full text-xs rounded-lg px-3 py-2 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition cursor-pointer disabled:opacity-50">
                <FileText className="w-3.5 h-3.5 text-red-400" />
                {loading === 'pdf' ? 'Gerando…' : 'PDF (.pdf)'}
              </button>

              <div className="border-t border-white/[0.06] my-1" />

              <button
                onClick={() => { setOpen(false); setModal(true) }}
                className="flex items-center gap-2.5 w-full text-xs rounded-lg px-3 py-2 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition cursor-pointer">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
                Personalizado…
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal personalizado ───────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />

          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[hsl(220_52%_6%)] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-foreground">Exportação Personalizada</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.size} de {columns.length} colunas selecionadas</p>
              </div>
              <button onClick={() => setModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formato */}
            <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Formato</p>
              <div className="flex gap-2">
                {(['xlsx', 'pdf'] as const).map(f => (
                  <button key={f} onClick={() => setModalFmt(f)}
                    className={clsx(
                      'flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition cursor-pointer flex-1',
                      modalFmt === f
                        ? 'border-brand-500/40 bg-brand-500/10 text-brand-400 font-semibold'
                        : 'border-white/10 text-muted-foreground hover:bg-white/[0.04]',
                    )}>
                    {f === 'xlsx'
                      ? <FileSpreadsheet className="w-4 h-4 text-green-400" />
                      : <FileText className="w-4 h-4 text-red-400" />}
                    {f === 'xlsx' ? 'Excel (.xlsx)' : 'PDF (.pdf)'}
                    {modalFmt === f && <Check className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Colunas por grupo */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Colunas</p>
              {Object.entries(groups).map(([group, cols]) => {
                const allOn = cols.every(c => selected.has(c.key))
                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-foreground/70">{group}</span>
                      <button onClick={() => toggleGroup(cols)}
                        className="text-[10px] text-brand-400 hover:text-brand-300 cursor-pointer">
                        {allOn ? 'Desmarcar todos' : 'Marcar todos'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {cols.map(c => (
                        <label key={c.key}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer group">
                          <div className={clsx(
                            'w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition',
                            selected.has(c.key)
                              ? 'bg-brand-600 border-brand-600'
                              : 'border-white/20 group-hover:border-white/40',
                          )}>
                            {selected.has(c.key) && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <input type="checkbox" className="sr-only"
                            checked={selected.has(c.key)}
                            onChange={() => toggleCol(c.key)} />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition truncate">
                            {c.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
              <div className="flex gap-2">
                <button onClick={() => setSelected(new Set(columns.map(c => c.key)))}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                  Todas
                </button>
                <span className="text-muted-foreground">·</span>
                <button onClick={() => setSelected(new Set())}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                  Nenhuma
                </button>
              </div>
              <button
                disabled={selected.size === 0 || !!loading}
                onClick={doCustomExport}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-40 transition cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                {loading ? 'Gerando…' : `Exportar ${modalFmt === 'xlsx' ? 'Excel' : 'PDF'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
