import type { Metadata } from 'next'
import './globals.css'
import { DataProvider } from '@/context/DataContext'
import { FilterProvider } from '@/context/FilterContext'
import { ThemeProvider } from '@/context/ThemeContext'
import DashboardLayout from '@/components/layout/DashboardLayout'

export const metadata: Metadata = {
  title: 'Dashboard de Performance',
  description: 'Dashboard operacional de lojas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <DataProvider>
            <FilterProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </FilterProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
