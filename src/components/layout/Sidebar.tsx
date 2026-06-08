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
  ShieldCheck,
} from 'lucide-react'

const MENU = [
  { href: '/visao-geral',   label: 'Visão Geral',       icon: LayoutDashboard },
  { href: '/vendas',        label: 'Vendas e Metas',     icon: TrendingUp },
  { href: '/ranking',       label: 'Ranking de Lojas',   icon: Trophy },
  { href: '/cancelamentos', label: 'Cancelamentos',      icon: XCircle },
  { href: '/indicadores',   label: 'Indicadores',        icon: Activity },
  { href: '/perda-venda',   label: 'Perda de Venda',     icon: TrendingDown },
  { href: '/tabela',        label: 'Tabela Detalhada',   icon: Table2 },
  { href: '/auditoria',     label: 'Auditoria de Dados', icon: ShieldCheck },
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
        'group bg-sidebar-bg flex flex-col shadow-sidebar overflow-hidden',
        'fixed top-0 left-0 h-full z-30',
        // Mobile: drawer deslizante
        'w-[220px] transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: sempre visível, recolhido — expande ao hover
        'md:translate-x-0 md:w-14 md:hover:w-[220px] md:transition-all md:duration-200 md:ease-in-out'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-5 border-b border-sidebar-border min-h-[65px]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center justify-between flex-1 min-w-0 overflow-hidden">
            <h1 className="text-[13px] font-bold text-white leading-tight tracking-tight whitespace-nowrap opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-100 md:delay-100 md:block hidden">
              Performance
            </h1>
            {/* Texto visível no mobile (sidebar sempre expandida) */}
            <h1 className="text-[13px] font-bold text-white leading-tight tracking-tight truncate md:hidden">
              Performance
            </h1>
            {/* Botão fechar no mobile */}
            <button
              onClick={onClose}
              className="md:hidden flex-shrink-0 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] px-2 mb-3 whitespace-nowrap
            opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-100 md:delay-100 hidden md:block">
            Navegação
          </p>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] px-2 mb-3 whitespace-nowrap md:hidden">
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
                  'relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13px] font-medium',
                  'transition-all duration-150 group/item cursor-pointer',
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
                    active ? 'text-brand-400' : 'text-slate-500 group-hover/item:text-slate-300'
                  )}
                />
                {/* Label desktop: aparece com fade ao expandir */}
                <span className="truncate whitespace-nowrap hidden md:block
                  opacity-0 group-hover:opacity-100 transition-opacity duration-100 delay-100">
                  {item.label}
                </span>
                {/* Label mobile: sempre visível */}
                <span className="truncate whitespace-nowrap md:hidden">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap hidden md:block
              opacity-0 group-hover:opacity-100 transition-opacity duration-100 delay-100">
              Sistema Online
            </p>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap md:hidden">
              Sistema Online
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
