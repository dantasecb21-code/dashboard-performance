'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutDashboard,
  TrendingUp,
  Trophy,
  XCircle,
  Activity,
  TrendingDown,
  Table2,
  Zap,
  X,
} from 'lucide-react'

const MENU = [
  { href: '/visao-geral',   label: 'Visão Geral',      icon: LayoutDashboard },
  { href: '/vendas',        label: 'Vendas e Metas',    icon: TrendingUp },
  { href: '/ranking',       label: 'Ranking de Lojas',  icon: Trophy },
  { href: '/cancelamentos', label: 'Cancelamentos',     icon: XCircle },
  { href: '/indicadores',   label: 'Indicadores',       icon: Activity },
  { href: '/perda-venda',   label: 'Perda de Venda',    icon: TrendingDown },
  { href: '/tabela',        label: 'Tabela Detalhada',  icon: Table2 },
]

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 z-20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'group flex flex-col overflow-hidden',
        'fixed top-0 left-0 h-full z-30',
        'bg-white dark:bg-[hsl(222_47%_9%)] border-r border-slate-200 dark:border-[hsl(214_32%_18%)]',
        'shadow-[2px_0_12px_-4px_hsl(215_25%_27%/0.08)] dark:shadow-[2px_0_12px_-4px_hsl(222_47%_4%/0.4)]',
        'w-[220px] transition-all duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:w-14 md:hover:w-[220px]'
      )}>

        {/* Linha teal no topo da sidebar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(192_91%_36%/0.7)] to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-[18px] border-b border-slate-100 dark:border-[hsl(214_32%_18%)] min-h-[65px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(192_91%_36%)] to-[hsl(192_91%_26%)] flex items-center justify-center flex-shrink-0 shadow-[0_4px_10px_-2px_hsl(192_91%_36%/0.35)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center justify-between flex-1 min-w-0 overflow-hidden">
            <div className="min-w-0 overflow-hidden hidden md:block
              opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
              <h1 className="text-[13px] font-heading font-bold text-slate-800 dark:text-slate-100 leading-none tracking-[0.06em] whitespace-nowrap">
                Performance
              </h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 tracking-[0.22em] uppercase mt-1 font-semibold whitespace-nowrap">
                Dashboard
              </p>
            </div>
            <div className="min-w-0 overflow-hidden md:hidden">
              <h1 className="text-[13px] font-heading font-bold text-slate-800 dark:text-slate-100 leading-none tracking-[0.06em] truncate">
                Performance
              </h1>
            </div>
            <button
              onClick={onClose}
              className="md:hidden flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {/* Label desktop */}
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em] px-2 mb-3 whitespace-nowrap
            opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75 hidden md:block">
            Navegação
          </p>
          {/* Label mobile */}
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em] px-2 mb-3 whitespace-nowrap md:hidden">
            Navegação
          </p>

          {MENU.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-semibold',
                  'transition-all duration-200 overflow-hidden cursor-pointer group/item',
                  active
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-[hsl(222_47%_14%)]'
                )}
              >
                {active && (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-r from-[hsl(192_91%_36%)] to-[hsl(192_91%_30%)] rounded-xl" />
                    <span className="absolute inset-0 rounded-xl shadow-[inset_0_1px_0_hsl(0_0%_100%/0.15),0_4px_14px_-4px_hsl(192_91%_36%/0.45)]" />
                  </>
                )}
                {!active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[hsl(192_91%_36%)] rounded-full
                    group-hover/item:h-4 transition-all duration-200 opacity-0 group-hover/item:opacity-100" />
                )}
                <Icon
                  className={clsx(
                    'relative w-4 h-4 flex-shrink-0',
                    active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300 transition-colors'
                  )}
                  strokeWidth={active ? 2.4 : 2.1}
                />
                {/* Label desktop */}
                <span className="relative truncate whitespace-nowrap hidden md:block
                  opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
                  {item.label}
                </span>
                {/* Label mobile */}
                <span className="relative truncate whitespace-nowrap md:hidden">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-[hsl(214_32%_18%)]">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"
            />
            {/* Desktop */}
            <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap hidden md:block
              opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
              Sistema Online
            </p>
            {/* Mobile */}
            <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap md:hidden">
              Sistema Online
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
