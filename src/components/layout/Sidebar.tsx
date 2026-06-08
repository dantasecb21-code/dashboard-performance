'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const MENU = [
  { href: '/visao-geral',   label: 'Visão Geral',          icon: '📊' },
  { href: '/vendas',        label: 'Vendas e Metas',        icon: '💰' },
  { href: '/ranking',       label: 'Ranking de Lojas',      icon: '🏆' },
  { href: '/cancelamentos', label: 'Cancelamentos',         icon: '❌' },
  { href: '/indicadores',   label: 'Indicadores',           icon: '📈' },
  { href: '/perda-venda',   label: 'Perda de Venda',        icon: '📉' },
  { href: '/tabela',        label: 'Tabela Detalhada',      icon: '📋' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <h1 className="text-sm font-bold text-gray-900 leading-tight">Dashboard de Performance</h1>
        <p className="text-[10px] text-gray-400 mt-0.5">Operacional</p>
      </div>
      <nav className="flex-1 py-3 px-2">
        {MENU.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
