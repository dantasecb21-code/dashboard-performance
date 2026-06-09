'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { ChevronDown, Check, Search } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface Props {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  /** Mostra campo de busca interno quando há muitas opções */
  searchable?: boolean
  className?: string
}

export default function GlassSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Todos',
  searchable,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const autoSearch = searchable ?? options.length > 8
  const selected = options.find(o => o.value === value)

  const filtered = useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  // Posiciona o menu flutuante ancorado ao trigger (portal evita clipping do painel)
  const reposition = () => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setCoords({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 200) })
  }

  useEffect(() => {
    if (!open) return
    reposition()
    const onScroll = () => reposition()
    const onResize = () => reposition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  // Fecha ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
    setQuery('')
  }

  const isActive = value !== ''

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
        {label}
      </label>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'group flex items-center justify-between gap-2 text-xs rounded-lg px-2.5 py-1.5 w-full',
          'border backdrop-blur-sm transition-all duration-150 cursor-pointer',
          isActive
            ? 'bg-brand-50/80 border-brand-300 text-brand-700 font-semibold shadow-sm'
            : 'bg-white/[0.06] border-white/10 text-muted-foreground hover:border-white/20 hover:bg-white/[0.10]',
          open && !isActive && 'border-brand-300 ring-2 ring-brand-500/20',
          open && isActive && 'ring-2 ring-brand-500/20'
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200',
            open ? 'rotate-180 text-brand-500' : 'text-muted-foreground group-hover:text-muted-foreground'
          )}
        />
      </button>

      {open && coords && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 60 }}
          className="origin-top animate-glass-pop rounded-xl border border-white/15 bg-[hsl(265_22%_14%)] backdrop-blur-xl shadow-glass overflow-hidden"
        >
          {autoSearch && (
            <div className="p-2 border-b border-white/[0.06]/80">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full text-xs bg-white/[0.06] border border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                />
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto p-1">
            {/* Opção "Todos" / limpar */}
            <button
              type="button"
              onClick={() => pick('')}
              className={clsx(
                'flex items-center justify-between w-full text-xs rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer',
                value === '' ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:bg-white/[0.06]'
              )}
            >
              <span>{placeholder}</span>
              {value === '' && <Check className="w-3.5 h-3.5 text-brand-600" />}
            </button>

            {filtered.length === 0 && (
              <p className="text-[11px] text-muted-foreground text-center py-3">Nenhum resultado</p>
            )}

            {filtered.map(opt => {
              const active = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => pick(opt.value)}
                  className={clsx(
                    'flex items-center justify-between w-full text-xs rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer text-left',
                    active ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:bg-white/[0.06]'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
