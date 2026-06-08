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
    card:    'bg-white border-slate-200',
    icon:    'bg-slate-100 text-slate-500',
  },
  green: {
    card:    'bg-white border-slate-200',
    icon:    'bg-emerald-50 text-emerald-600',
  },
  red: {
    card:    'bg-white border-slate-200',
    icon:    'bg-red-50 text-red-600',
  },
  yellow: {
    card:    'bg-white border-slate-200',
    icon:    'bg-amber-50 text-amber-600',
  },
  blue: {
    card:    'bg-white border-slate-200',
    icon:    'bg-blue-50 text-blue-600',
  },
}

export default function KpiCard({ title, value, subtitle, delta, icon: Icon, color = 'default', size = 'md' }: Props) {
  const isPositiveDelta = delta !== null && delta !== undefined && delta > 0
  const isNegativeDelta = delta !== null && delta !== undefined && delta < 0
  const colors = COLOR_MAP[color]

  const DeltaIcon = isPositiveDelta ? TrendingUp : isNegativeDelta ? TrendingDown : Minus

  return (
    <div className={clsx(
      'rounded-xl border p-4 flex flex-col gap-2 transition-all duration-200 group cursor-default',
      'hover:shadow-card-hover hover:-translate-y-0.5',
      'shadow-card',
      colors.card
    )}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">
          {title}
        </span>
        {Icon && (
          <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', colors.icon)}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className={clsx('font-bold tabular-nums text-slate-900 leading-none', size === 'sm' ? 'text-xl' : 'text-2xl')}>
        {value === null || value === undefined || value === '' ? (
          <span className="text-slate-300">—</span>
        ) : value}
      </div>

      <div className="flex items-center gap-2 min-h-[16px]">
        {subtitle && (
          <span className="text-[11px] text-slate-400">{subtitle}</span>
        )}
        {delta !== null && delta !== undefined && (
          <span className={clsx(
            'flex items-center gap-0.5 text-[11px] font-semibold',
            isPositiveDelta ? 'text-emerald-600' : isNegativeDelta ? 'text-red-500' : 'text-slate-400'
          )}>
            <DeltaIcon className="w-3 h-3" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
