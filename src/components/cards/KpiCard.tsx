'use client'
import { useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus, Info, type LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  delta?: number | null
  icon?: LucideIcon
  color?: 'default' | 'green' | 'red' | 'yellow' | 'blue'
  size?: 'sm' | 'md'
  tooltip?: string
}

const ICON_VARIANT: Record<NonNullable<Props['color']>, string> = {
  default: 'bg-cyan-50   text-cyan-600',
  green:   'bg-green-50  text-green-600',
  red:     'bg-red-50    text-red-600',
  yellow:  'bg-amber-50  text-amber-600',
  blue:    'bg-blue-50   text-blue-600',
}

const GLOW_COLOR: Record<NonNullable<Props['color']>, string> = {
  default: 'bg-cyan-100/60',
  green:   'bg-green-100/60',
  red:     'bg-red-100/60',
  yellow:  'bg-amber-100/60',
  blue:    'bg-blue-100/60',
}

const HOVER_SHADOW: Record<NonNullable<Props['color']>, string> = {
  default: 'hover:shadow-[0_8px_24px_-6px_hsl(192_91%_36%/0.18)] hover:border-cyan-200',
  green:   'hover:shadow-[0_8px_24px_-6px_hsl(142_72%_29%/0.18)] hover:border-green-200',
  red:     'hover:shadow-[0_8px_24px_-6px_hsl(0_72%_51%/0.15)]   hover:border-red-200',
  yellow:  'hover:shadow-[0_8px_24px_-6px_hsl(32_95%_44%/0.15)]  hover:border-amber-200',
  blue:    'hover:shadow-[0_8px_24px_-6px_hsl(217_91%_60%/0.15)] hover:border-blue-200',
}

const VALUE_COLOR: Record<NonNullable<Props['color']>, string> = {
  default: 'text-slate-900',
  green:   'text-green-700',
  red:     'text-red-600',
  yellow:  'text-amber-700',
  blue:    'text-blue-700',
}

function adaptiveFontSize(value: string | number, size: 'sm' | 'md'): string {
  const len = String(value ?? '').length
  if (len > 13) return 'text-sm sm:text-base'
  if (len > 10) return 'text-base sm:text-lg'
  if (len > 7)  return 'text-lg'
  return size === 'sm' ? 'text-lg' : 'text-xl'
}

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const show = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      // 232 = tooltip width (w-58 ~232px) + small buffer
      setAlignRight(rect.left + 232 > window.innerWidth - 8)
    }
    setOpen(true)
  }, [])

  return (
    <div
      ref={ref}
      className="relative flex-shrink-0"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onTouchStart={e => { e.stopPropagation(); open ? setOpen(false) : show() }}
    >
      <Info className="w-3 h-3 text-[hsl(218_18%_36%)] hover:text-[hsl(218_18%_55%)] cursor-help transition-colors" />

      {open && (
        <div className={clsx(
          'absolute bottom-full mb-2 z-[9999] w-56 rounded-xl pointer-events-none',
          'bg-white border border-slate-200',
          'text-slate-700 text-[11px] leading-relaxed p-3 shadow-lg',
          'whitespace-normal font-normal normal-case tracking-normal',
          alignRight ? 'right-0' : 'left-0',
        )}>
          {text}
          <span className={clsx(
            'absolute top-full border-4 border-transparent border-t-white block w-0 h-0',
            alignRight ? 'right-3' : 'left-3',
          )} />
        </div>
      )}
    </div>
  )
}

export default function KpiCard({ title, value, subtitle, delta, icon: Icon, color = 'default', size = 'md', tooltip }: Props) {
  const isEmpty = value === null || value === undefined || value === ''
  const isPositiveDelta = delta !== null && delta !== undefined && delta > 0
  const isNegativeDelta = delta !== null && delta !== undefined && delta < 0
  const DeltaIcon = isPositiveDelta ? TrendingUp : isNegativeDelta ? TrendingDown : Minus
  const valueFontSize = adaptiveFontSize(value, size)

  return (
    <div className={clsx(
      'glass-card group cursor-default',
      'p-3 sm:p-4 lg:p-5',
      'transition-all duration-200',
      'hover:-translate-y-0.5',
      HOVER_SHADOW[color],
    )}>
      {/* Corner accent — muito suave */}
      <div className={clsx(
        'pointer-events-none absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-50',
        GLOW_COLOR[color],
      )} />

      {/* Cabeçalho */}
      <div className="relative flex items-start justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-tight line-clamp-2">
            {title}
          </p>
          {tooltip && <Tooltip text={tooltip} />}
        </div>
        {Icon && (
          <div className={clsx(
            'relative p-1.5 sm:p-2 rounded-xl border border-slate-100 shrink-0',
            ICON_VARIANT[color],
          )}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Valor */}
      <div className={clsx(
        'relative font-heading font-extrabold leading-[1.05] tracking-tight tabular-nums mt-2.5 min-w-0 break-words',
        color === 'default' ? 'stat-glow' : '',
        valueFontSize,
        VALUE_COLOR[color],
      )}>
        {isEmpty ? <span className="text-slate-300 text-xl">—</span> : value}
      </div>

      {/* Subtitle / delta */}
      <div className="relative flex items-center gap-2 mt-1.5 min-h-[18px]">
        {subtitle && (
          <p className="text-[9px] sm:text-[11px] text-slate-400 flex items-center gap-1 truncate">
            <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
            <span className="truncate">{subtitle}</span>
          </p>
        )}
        {delta !== null && delta !== undefined && (
          <span className={clsx(
            'flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0',
            isPositiveDelta
              ? 'bg-green-50 text-green-700'
              : isNegativeDelta
              ? 'bg-red-50 text-red-600'
              : 'bg-slate-100 text-slate-500'
          )}>
            <DeltaIcon className="w-3 h-3" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
