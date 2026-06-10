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
  default: 'bg-[hsl(177_100%_41%/0.12)] text-[hsl(177_100%_55%)]',
  green:   'bg-[hsl(143_78%_46%/0.12)] text-[hsl(143_78%_55%)]',
  red:     'bg-[hsl(349_100%_61%/0.12)] text-[hsl(349_100%_68%)]',
  yellow:  'bg-[hsl(26_100%_58%/0.12)]  text-[hsl(26_100%_65%)]',
  blue:    'bg-[hsl(207_90%_63%/0.12)]  text-[hsl(207_90%_68%)]',
}

const GLOW_COLOR: Record<NonNullable<Props['color']>, string> = {
  default: 'bg-[hsl(177_100%_41%/0.18)]',
  green:   'bg-[hsl(143_78%_46%/0.18)]',
  red:     'bg-[hsl(349_100%_61%/0.18)]',
  yellow:  'bg-[hsl(26_100%_58%/0.18)]',
  blue:    'bg-[hsl(207_90%_63%/0.18)]',
}

const HOVER_SHADOW: Record<NonNullable<Props['color']>, string> = {
  default: 'hover:shadow-[0_20px_50px_-15px_hsl(177_100%_41%/0.35)]',
  green:   'hover:shadow-[0_20px_50px_-15px_hsl(143_78%_46%/0.35)]',
  red:     'hover:shadow-[0_20px_50px_-15px_hsl(349_100%_61%/0.30)]',
  yellow:  'hover:shadow-[0_20px_50px_-15px_hsl(26_100%_58%/0.30)]',
  blue:    'hover:shadow-[0_20px_50px_-15px_hsl(207_90%_63%/0.30)]',
}

const VALUE_COLOR: Record<NonNullable<Props['color']>, string> = {
  default: 'text-foreground',
  green:   'text-[hsl(143_78%_60%)]',
  red:     'text-[hsl(349_100%_68%)]',
  yellow:  'text-[hsl(26_100%_68%)]',
  blue:    'text-[hsl(207_90%_72%)]',
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
          'bg-[hsl(220_52%_9%)] border border-[hsl(220_40%_18%)]',
          'text-foreground text-[11px] leading-relaxed p-3 shadow-2xl',
          'whitespace-normal font-normal normal-case tracking-normal',
          alignRight ? 'right-0' : 'left-0',
        )}>
          {text}
          <span className={clsx(
            'absolute top-full border-4 border-transparent border-t-[hsl(220_52%_9%)] block w-0 h-0',
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
      'transition-all duration-400',
      'hover:-translate-y-0.5 hover:border-[hsl(177_100%_41%/0.3)]',
      HOVER_SHADOW[color],
    )}>
      {/* Sheen no hover */}
      <div className="pointer-events-none absolute -inset-px rounded-[0.875rem]
        bg-[radial-gradient(130%_80%_at_0%_0%,hsl(177_100%_41%/0.12),transparent_55%)]
        opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {/* Corner glow */}
      <div className={clsx(
        'pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-40',
        GLOW_COLOR[color],
      )} />

      {/* Cabeçalho */}
      <div className="relative flex items-start justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(218_18%_46%)] leading-tight line-clamp-2">
            {title}
          </p>
          {tooltip && <Tooltip text={tooltip} />}
        </div>
        {Icon && (
          <div className={clsx(
            'relative p-1.5 sm:p-2 rounded-xl border border-white/[0.08] backdrop-blur-md shrink-0',
            'shadow-[inset_0_1px_0_hsl(0_0%_100%/0.08)]',
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
        {isEmpty ? <span className="text-[hsl(218_18%_30%)] text-xl">—</span> : value}
      </div>

      {/* Subtitle / delta */}
      <div className="relative flex items-center gap-2 mt-1.5 min-h-[18px]">
        {subtitle && (
          <p className="text-[9px] sm:text-[11px] text-[hsl(218_18%_42%)] flex items-center gap-1 truncate">
            <span
              className="w-1 h-1 rounded-full bg-[hsl(177_100%_41%/0.7)] shrink-0"
              style={{ boxShadow: '0 0 5px hsl(177 100% 41%)' }}
            />
            <span className="truncate">{subtitle}</span>
          </p>
        )}
        {delta !== null && delta !== undefined && (
          <span className={clsx(
            'flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0',
            isPositiveDelta
              ? 'bg-[hsl(143_78%_46%/0.12)] text-[hsl(143_78%_60%)]'
              : isNegativeDelta
              ? 'bg-[hsl(349_100%_61%/0.12)] text-[hsl(349_100%_68%)]'
              : 'bg-white/[0.05] text-[hsl(218_18%_45%)]'
          )}>
            <DeltaIcon className="w-3 h-3" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
