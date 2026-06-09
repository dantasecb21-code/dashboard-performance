import clsx from 'clsx'
import type { StatusCor, StatusLoja } from '@/types/dashboard'

interface Props {
  status: StatusCor | StatusLoja | string
  label?: string
  size?: 'sm' | 'md'
}

const MAP: Record<string, string> = {
  verde:    'bg-[hsl(143_78%_46%/0.14)] text-[hsl(143_78%_58%)] border-[hsl(143_78%_46%/0.22)]',
  amarelo:  'bg-[hsl(26_100%_58%/0.14)]  text-[hsl(26_100%_65%)]  border-[hsl(26_100%_58%/0.22)]',
  vermelho: 'bg-[hsl(349_100%_61%/0.14)] text-[hsl(349_100%_68%)] border-[hsl(349_100%_61%/0.22)]',
  neutro:   'bg-white/[0.05] text-[hsl(218_18%_50%)] border-white/[0.08]',
  Saudável: 'bg-[hsl(143_78%_46%/0.14)] text-[hsl(143_78%_58%)] border-[hsl(143_78%_46%/0.22)]',
  'Atenção':        'bg-[hsl(26_100%_58%/0.14)]  text-[hsl(26_100%_65%)]  border-[hsl(26_100%_58%/0.22)]',
  'Crítica':        'bg-[hsl(349_100%_61%/0.14)] text-[hsl(349_100%_68%)] border-[hsl(349_100%_61%/0.22)]',
  'Acima da meta':  'bg-[hsl(143_78%_46%/0.14)] text-[hsl(143_78%_58%)] border-[hsl(143_78%_46%/0.22)]',
  'Abaixo da meta': 'bg-[hsl(349_100%_61%/0.14)] text-[hsl(349_100%_68%)] border-[hsl(349_100%_61%/0.22)]',
}

export default function StatusBadge({ status, label, size = 'md' }: Props) {
  const cls = MAP[status] ?? 'bg-white/[0.05] text-[hsl(218_18%_50%)] border-white/[0.08]'
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
