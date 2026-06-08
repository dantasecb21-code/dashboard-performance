// Esta route só é usada em desenvolvimento (npm run dev).
// Em produção (GitHub Pages) os dados vêm de public/data.json gerado pelo script scripts/generate-data.mjs
import { NextResponse } from 'next/server'
import { fetchLojas } from '@/lib/googleSheets'

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
