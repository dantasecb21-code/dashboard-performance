'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background relative">
      {/* Radial glow background */}
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      {/* Grid pattern */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 md:ml-14">
          <TopBar onMenuToggle={() => setSidebarOpen(v => !v)} />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
