import clsx from 'clsx'
import type { StatusCor, StatusLoja } from '@/types/dashboard'

interface Props {
  status: StatusCor | StatusLoja | string
  label?: string
  size?: 'sm' | 'md'
}

const MAP: Record<string, string> = {
  verde:    'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-400 dark:border-green-900',
  amarelo:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900',
  vermelho: 'bg-red-50   text-red-700   border-red-200   dark:bg-red-950/60   dark:text-red-400   dark:border-red-900',
  neutro:   'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700',
  Saudável:        'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-400 dark:border-green-900',
  'Atenção':       'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900',
  'Crítica':       'bg-red-50   text-red-700   border-red-200   dark:bg-red-950/60   dark:text-red-400   dark:border-red-900',
  'Acima da meta': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-400 dark:border-green-900',
  'Abaixo da meta':'bg-red-50   text-red-700   border-red-200   dark:bg-red-950/60   dark:text-red-400   dark:border-red-900',
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
