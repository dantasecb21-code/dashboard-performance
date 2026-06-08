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

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-[220px] flex-shrink-0 bg-sidebar-bg min-h-screen flex flex-col shadow-sidebar">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[13px] font-semibold text-white leading-tight truncate">
              Performance
            </h1>
            <p className="text-[10px] text-sidebar-text mt-0.5">Dashboard Operacional</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2 mt-1">
          Menu
        </p>
        {MENU.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group cursor-pointer',
                active
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
              )}
            >
              <Icon
                className={clsx(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  active ? 'text-white' : 'text-slate-400 group-hover:text-white'
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-[10px] text-slate-500 text-center">iFood · Dantas ECB</p>
      </div>
    </aside>
  )
}
