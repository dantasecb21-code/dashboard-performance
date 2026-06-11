import clsx from 'clsx'
import type { StatusCor, StatusLoja } from '@/types/dashboard'

interface Props {
  status: StatusCor | StatusLoja | string
  label?: string
  size?: 'sm' | 'md'
}

const MAP: Record<string, string> = {
  verde:    'bg-green-50 text-green-700 border-green-200 dark:bg-[hsl(142_20%_10%)] dark:text-[hsl(142_45%_48%)] dark:border-[hsl(142_25%_16%)]',
  amarelo:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[hsl(32_20%_11%)]  dark:text-[hsl(32_60%_50%)]  dark:border-[hsl(32_25%_17%)]',
  vermelho: 'bg-red-50   text-red-700   border-red-200   dark:bg-[hsl(0_20%_11%)]   dark:text-[hsl(0_52%_52%)]   dark:border-[hsl(0_25%_17%)]',
  neutro:   'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[hsl(217_20%_13%)] dark:text-slate-400 dark:border-[hsl(215_22%_18%)]',
  Saudável:        'bg-green-50 text-green-700 border-green-200 dark:bg-[hsl(142_20%_10%)] dark:text-[hsl(142_45%_48%)] dark:border-[hsl(142_25%_16%)]',
  'Atenção':       'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[hsl(32_20%_11%)]  dark:text-[hsl(32_60%_50%)]  dark:border-[hsl(32_25%_17%)]',
  'Crítica':       'bg-red-50   text-red-700   border-red-200   dark:bg-[hsl(0_20%_11%)]   dark:text-[hsl(0_52%_52%)]   dark:border-[hsl(0_25%_17%)]',
  'Acima da meta': 'bg-green-50 text-green-700 border-green-200 dark:bg-[hsl(142_20%_10%)] dark:text-[hsl(142_45%_48%)] dark:border-[hsl(142_25%_16%)]',
  'Abaixo da meta':'bg-red-50   text-red-700   border-red-200   dark:bg-[hsl(0_20%_11%)]   dark:text-[hsl(0_52%_52%)]   dark:border-[hsl(0_25%_17%)]',
}

export default function StatusBadge({ status, label, size = 'md' }: Props) {
  const cls = MAP[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-semibold border',
      cls,
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
    )}>
      {label ?? status}
    </span>
  )
}
