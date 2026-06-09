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
  default: 'bg-primary/15 text-primary',
  green:   'bg-success/15 text-success',
  red:     'bg-destructive/15 text-destructive',
  yellow:  'bg-warning/15 text-warning',
  blue:    'bg-info/15 text-info',
}

const GLOW_COLOR: Record<NonNullable<Props['color']>, string> = {
  default: 'bg-primary/20',
  green:   'bg-success/20',
  red:     'bg-destructive/20',
  yellow:  'bg-warning/20',
  blue:    'bg-info/20',
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

  return (
    <div className={clsx(
      'glass-card group relative overflow-hidden cursor-default',
      'p-3 sm:p-4 lg:p-5',
      'transition-all duration-500',
      'hover:-translate-y-0.5 hover:border-primary/40',
      'hover:shadow-[0_24px_60px_-20px_hsl(var(--primary)/0.45)]',
    )}>
      {/* Sheen no hover */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl
        bg-[radial-gradient(120%_80%_at_0%_0%,hsl(var(--primary)/0.18),transparent_55%)]
        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Corner glow permanente */}
      <div className={clsx(
        'pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-50',
        glowClass
      )} />

      {/* Cabeçalho: label + tooltip + ícone */}
      <div className="relative flex items-start justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground leading-tight line-clamp-2">
            {title}
          </p>
          {tooltip && (
            <div className="relative group/tip flex-shrink-0">
              <Info className="w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-2 z-50 w-56 rounded-xl
                bg-card border border-white/10 text-foreground text-[11px] leading-relaxed p-3 shadow-2xl
                opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity duration-150
                whitespace-normal font-normal normal-case tracking-normal">
                {tooltip}
                <span className="absolute top-full left-3 border-4 border-transparent border-t-card block w-0 h-0" />
              </div>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx(
            'relative p-1.5 sm:p-2 rounded-xl border border-white/10 backdrop-blur-md shrink-0',
            'shadow-[inset_0_1px_0_hsl(0_0%_100%/0.12)]',
            iconClass
          )}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Valor */}
      <div className={clsx(
        'relative font-heading font-extrabold text-foreground stat-glow',
        'leading-[1.05] tracking-tight tabular-nums mt-2 min-w-0 break-words',
        valueFontSize,
      )}>
        {isEmpty ? <span className="text-muted-foreground/40 text-xl">—</span> : value}
      </div>

      {/* Subtitle / delta */}
      <div className="relative flex items-center gap-2 mt-1.5 min-h-[18px]">
        {subtitle && (
          <p className="text-[9px] sm:text-[11px] text-muted-foreground flex items-center gap-1 truncate">
            <span className="w-1 h-1 rounded-full bg-primary/70 shadow-[0_0_6px_hsl(var(--primary))] shrink-0" />
            <span className="truncate">{subtitle}</span>
          </p>
        )}
        {delta !== null && delta !== undefined && (
          <span className={clsx(
            'flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0',
            isPositiveDelta
              ? 'bg-success/15 text-success'
              : isNegativeDelta
              ? 'bg-destructive/15 text-destructive'
              : 'bg-muted-foreground/10 text-muted-foreground'
          )}>
            <DeltaIcon className="w-3 h-3" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
