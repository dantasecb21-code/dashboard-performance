import clsx from 'clsx'
import type { StatusCor, StatusLoja } from '@/types/dashboard'

interface Props {
  status: StatusCor | StatusLoja | string
  label?: string
  size?: 'sm' | 'md'
}

const MAP: Record<string, string> = {
  verde:    'bg-green-100 text-green-800',
  amarelo:  'bg-yellow-100 text-yellow-800',
  vermelho: 'bg-red-100 text-red-800',
  neutro:   'bg-gray-100 text-gray-600',
  Saudável: 'bg-green-100 text-green-800',
  Atenção:  'bg-yellow-100 text-yellow-800',
  Crítica:  'bg-red-100 text-red-800',
  'Acima da meta':  'bg-green-100 text-green-800',
  'Abaixo da meta': 'bg-red-100 text-red-800',
}

export default function StatusBadge({ status, label, size = 'md' }: Props) {
  const cls = MAP[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={clsx('inline-flex items-center rounded-full font-medium', cls,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs')}>
      {label ?? status}
    </span>
  )
}
