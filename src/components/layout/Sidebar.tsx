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
  { href: '/visao-geral',   label: 'Visão Geral',       icon: LayoutDashboard },
  { href: '/vendas',        label: 'Vendas e Metas',     icon: TrendingUp },
  { href: '/ranking',       label: 'Ranking de Lojas',   icon: Trophy },
  { href: '/cancelamentos', label: 'Cancelamentos',      icon: XCircle },
  { href: '/indicadores',   label: 'Indicadores',        icon: Activity },
  { href: '/perda-venda',   label: 'Perda de Venda',     icon: TrendingDown },
  { href: '/tabela',        label: 'Tabela Detalhada',   icon: Table2 },
]

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay escuro no mobile quando sidebar está aberta */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'w-[220px] flex-shrink-0 bg-sidebar-bg flex flex-col shadow-sidebar',
        // Mobile: drawer fixo que entra/sai pela esquerda
        'fixed top-0 left-0 h-full z-30 transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: sempre visível no fluxo normal
        'md:relative md:translate-x-0 md:h-auto md:min-h-screen'
      )}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[13px] font-bold text-white leading-tight tracking-tight truncate">
                Performance
              </h1>
            </div>
          </div>
          {/* Botão fechar no mobile */}
          <button
            onClick={onClose}
            className="md:hidden flex-shrink-0 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] px-2 mb-3">
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
                  'relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium',
                  'transition-all duration-150 group cursor-pointer',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-400 rounded-r-full" />
                )}
                <Icon
                  className={clsx(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <p className="text-[10px] text-slate-500 font-medium">Sistema Online</p>
          </div>
        </div>
      </aside>
    </>
  )
}
