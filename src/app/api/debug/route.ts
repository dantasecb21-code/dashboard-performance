import { NextResponse } from 'next/server'
import { fetchDebugData } from '@/lib/googleSheets'

export async function GET() {
  try {
    const data = await fetchDebugData()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
