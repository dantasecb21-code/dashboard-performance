import clsx from 'clsx'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  delta?: number | null      // variação percentual
  icon?: string
  color?: 'default' | 'green' | 'red' | 'yellow' | 'blue'
  size?: 'sm' | 'md'
}

const COLOR_MAP = {
  default: 'bg-white border-gray-200',
  green:   'bg-green-50 border-green-200',
  red:     'bg-red-50 border-red-200',
  yellow:  'bg-yellow-50 border-yellow-200',
  blue:    'bg-blue-50 border-blue-200',
}

export default function KpiCard({ title, value, subtitle, delta, icon, color = 'default', size = 'md' }: Props) {
  const isPositiveDelta = delta !== null && delta !== undefined && delta > 0
  const isNegativeDelta = delta !== null && delta !== undefined && delta < 0
  return (
    <div className={clsx('rounded-xl border p-4 flex flex-col gap-1 shadow-sm', COLOR_MAP[color])}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={clsx('font-bold text-gray-900', size === 'sm' ? 'text-xl' : 'text-2xl')}>
        {value === null || value === undefined || value === '' ? '—' : value}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        {delta !== null && delta !== undefined && (
          <span className={clsx('text-xs font-medium', isPositiveDelta ? 'text-green-600' : isNegativeDelta ? 'text-red-600' : 'text-gray-500')}>
            {isPositiveDelta ? '▲' : isNegativeDelta ? '▼' : ''}
            {' '}{Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
