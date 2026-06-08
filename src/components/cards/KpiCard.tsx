import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  delta?: number | null
  icon?: LucideIcon
  color?: 'default' | 'green' | 'red' | 'yellow' | 'blue'
  size?: 'sm' | 'md'
}

const COLOR_MAP = {
  default: {
    border: 'border-slate-200',
    accent: 'bg-slate-300',
    icon:   'bg-slate-100 text-slate-500',
    value:  'text-slate-900',
  },
  green: {
    border: 'border-emerald-100',
    accent: 'bg-emerald-500',
    icon:   'bg-emerald-50 text-emerald-600',
    value:  'text-emerald-900',
  },
  red: {
    border: 'border-red-100',
    accent: 'bg-red-500',
    icon:   'bg-red-50 text-red-600',
    value:  'text-red-900',
  },
  yellow: {
    border: 'border-amber-100',
    accent: 'bg-amber-400',
    icon:   'bg-amber-50 text-amber-600',
    value:  'text-amber-900',
  },
  blue: {
    border: 'border-blue-100',
    accent: 'bg-blue-500',
    icon:   'bg-blue-50 text-blue-600',
    value:  'text-blue-900',
  },
}

function adaptiveFontSize(value: string | number, size: 'sm' | 'md'): string {
  const len = String(value ?? '').length
  if (len > 13) return 'text-sm sm:text-base'
  if (len > 10) return 'text-base sm:text-lg'
  if (len > 7)  return 'text-lg'
  return size === 'sm' ? 'text-lg' : 'text-xl'
}

export default function KpiCard({ title, value, subtitle, delta, icon: Icon, color = 'default', size = 'md' }: Props) {
  const isPositiveDelta = delta !== null && delta !== undefined && delta > 0
  const isNegativeDelta = delta !== null && delta !== undefined && delta < 0
  const colors = COLOR_MAP[color]
  const DeltaIcon = isPositiveDelta ? TrendingUp : isNegativeDelta ? TrendingDown : Minus
  const valueFontSize = adaptiveFontSize(value, size)

  return (
    <div className={clsx(
      'relative rounded-xl border bg-white flex flex-col overflow-hidden',
      'transition-all duration-200 cursor-default group',
      'hover:shadow-card-hover hover:-translate-y-0.5 shadow-card',
      colors.border
    )}>
      {/* Accent strip */}
      <div className={clsx('h-[3px] w-full flex-shrink-0', colors.accent)} />

      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-tight">
            {title}
          </span>
          {Icon && (
            <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', colors.icon)}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className={clsx(
          'font-bold tabular-nums leading-tight min-w-0 break-words',
          valueFontSize,
          colors.value
        )}>
          {value === null || value === undefined || value === '' ? (
            <span className="text-slate-300 text-xl">—</span>
          ) : value}
        </div>

        <div className="flex items-center gap-2 min-h-[18px] mt-auto">
          {subtitle && (
            <span className="text-[11px] text-slate-400">{subtitle}</span>
          )}
          {delta !== null && delta !== undefined && (
            <span className={clsx(
              'flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
              isPositiveDelta
                ? 'bg-emerald-50 text-emerald-700'
                : isNegativeDelta
                ? 'bg-red-50 text-red-600'
                : 'bg-slate-100 text-slate-400'
            )}>
              <DeltaIcon className="w-3 h-3" />
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
