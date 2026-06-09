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

export default function KpiCard({ title, value, subtitle, delta, icon: Icon, color = 'default', size = 'md', tooltip }: Props) {
  const isEmpty = value === null || value === undefined || value === ''
  const isPositiveDelta = delta !== null && delta !== undefined && delta > 0
  const isNegativeDelta = delta !== null && delta !== undefined && delta < 0
  const DeltaIcon = isPositiveDelta ? TrendingUp : isNegativeDelta ? TrendingDown : Minus
  const valueFontSize = adaptiveFontSize(value, size)
  const iconClass = ICON_VARIANT[color]
  const glowClass = GLOW_COLOR[color]
  const hoverShadow = HOVER_SHADOW[color]
  const valueColor = VALUE_COLOR[color]

  return (
    <div className={clsx(
      'glass-card group cursor-default',
      'p-3 sm:p-4 lg:p-5',
      'transition-all duration-400',
      'hover:-translate-y-0.5 hover:border-[hsl(177_100%_41%/0.3)]',
      hoverShadow,
    )}>
      {/* Sheen no hover */}
      <div className="pointer-events-none absolute -inset-px rounded-[0.875rem]
        bg-[radial-gradient(130%_80%_at_0%_0%,hsl(177_100%_41%/0.12),transparent_55%)]
        opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {/* Corner glow */}
      <div className={clsx(
        'pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-40',
        glowClass
      )} />

      {/* Cabeçalho */}
      <div className="relative flex items-start justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(218_18%_46%)] leading-tight line-clamp-2">
            {title}
          </p>
          {tooltip && (
            <div className="relative group/tip flex-shrink-0">
              <Info className="w-3 h-3 text-[hsl(218_18%_36%)] hover:text-[hsl(218_18%_55%)] cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-2 z-50 w-56 rounded-xl
                bg-[hsl(220_52%_9%)] border border-[hsl(220_40%_18%)] text-foreground text-[11px] leading-relaxed p-3 shadow-2xl
                opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity duration-150
                whitespace-normal font-normal normal-case tracking-normal">
                {tooltip}
                <span className="absolute top-full left-3 border-4 border-transparent border-t-[hsl(220_52%_9%)] block w-0 h-0" />
              </div>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx(
            'relative p-1.5 sm:p-2 rounded-xl border border-white/[0.08] backdrop-blur-md shrink-0',
            'shadow-[inset_0_1px_0_hsl(0_0%_100%/0.08)]',
            iconClass
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
        valueColor,
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
