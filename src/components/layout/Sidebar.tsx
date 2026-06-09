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
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'group flex flex-col overflow-hidden',
        'fixed top-0 left-0 h-full z-30',
        'bg-[hsl(265_22%_9%)] border-r border-white/[0.08]',
        'shadow-[1px_0_0_0_hsl(280_20%_20%)]',
        'w-[220px] transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:w-14 md:hover:w-[220px] md:transition-all md:duration-200 md:ease-in-out'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-5 border-b border-white/[0.08] min-h-[65px]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.5)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center justify-between flex-1 min-w-0 overflow-hidden">
            <h1 className="text-[13px] font-heading font-bold text-foreground leading-tight tracking-[0.08em] whitespace-nowrap opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-100 md:delay-100 md:block hidden">
              Performance
            </h1>
            <h1 className="text-[13px] font-heading font-bold text-foreground leading-tight tracking-[0.08em] truncate md:hidden">
              Performance
            </h1>
            <button
              onClick={onClose}
              className="md:hidden flex-shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {/* Label "Navegação" — desktop */}
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.25em] px-2 mb-3 whitespace-nowrap
            opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-100 md:delay-100 hidden md:block">
            Navegação
          </p>
          {/* Label "Navegação" — mobile */}
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.25em] px-2 mb-3 whitespace-nowrap md:hidden">
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
                  'transition-all duration-300 overflow-hidden cursor-pointer',
                  active
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                )}
              >
                {/* Fundo gradiente no item ativo */}
                {active && (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/70 rounded-xl shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]" />
                    <span className="absolute inset-0 rounded-xl border border-white/15" />
                  </>
                )}
                <Icon
                  className={clsx(
                    'relative w-4 h-4 flex-shrink-0 transition-colors',
                    active ? 'text-white' : 'text-muted-foreground'
                  )}
                  strokeWidth={2.2}
                />
                {/* Label desktop */}
                <span className="relative truncate whitespace-nowrap hidden md:block
                  opacity-0 group-hover:opacity-100 transition-opacity duration-100 delay-100">
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
        <div className="px-3 py-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0 shadow-[0_0_6px_hsl(var(--success))]" />
            <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap hidden md:block
              opacity-0 group-hover:opacity-100 transition-opacity duration-100 delay-100">
              Sistema Online
            </p>
            <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap md:hidden">
              Sistema Online
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
