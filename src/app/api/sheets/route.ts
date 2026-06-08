import { NextResponse } from 'next/server'
import { fetchLojas } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const lojas = await fetchLojas()
    return NextResponse.json({ lojas, updatedAt: new Date().toISOString() })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[/api/sheets]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
