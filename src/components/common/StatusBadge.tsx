import clsx from 'clsx'
import type { StatusCor, StatusLoja } from '@/types/dashboard'

interface Props {
  status: StatusCor | StatusLoja | string
  label?: string
  size?: 'sm' | 'md'
}

const MAP: Record<string, string> = {
  verde:    'bg-success/15 text-success',
  amarelo:  'bg-warning/15 text-warning',
  vermelho: 'bg-red-100 text-destructive',
  neutro:   'bg-white/[0.06] text-muted-foreground',
  Saudável: 'bg-success/15 text-success',
  Atenção:  'bg-warning/15 text-warning',
  Crítica:  'bg-red-100 text-destructive',
  'Acima da meta':  'bg-success/15 text-success',
  'Abaixo da meta': 'bg-red-100 text-destructive',
}

export default function StatusBadge({ status, label, size = 'md' }: Props) {
  const cls = MAP[status] ?? 'bg-white/[0.06] text-muted-foreground'
  return (
    <span className={clsx('inline-flex items-center rounded-full font-medium', cls,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs')}>
      {label ?? status}
    </span>
  )
}
