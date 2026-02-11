import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'
import { TRPGSession } from '@/lib/parseDialogue'

export const dynamic = 'force-dynamic'
const TRPG_KEY = 'emin_trpg_sessions'

export async function GET() {
  try {
    const sessions = await kv.get<TRPGSession[]>(TRPG_KEY) || []
    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session: TRPGSession = await request.json()
    let sessions = await kv.get<TRPGSession[]>(TRPG_KEY)
    if (!Array.isArray(sessions)) sessions = []
    sessions.unshift(session)
    await kv.set(TRPG_KEY, sessions)
    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json({ error: 'TRPG 세션 저장에 실패했습니다.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedSession: TRPGSession = await request.json()
    updatedSession.updatedAt = new Date().toISOString()
    let sessions = await kv.get<TRPGSession[]>(TRPG_KEY)
    if (!Array.isArray(sessions)) sessions = []
    const index = sessions.findIndex(s => s.id === updatedSession.id)
    if (index === -1) return NextResponse.json({ error: '세션을 찾을 수 없습니다.' }, { status: 404 })
    sessions[index] = updatedSession
    await kv.set(TRPG_KEY, sessions)
    return NextResponse.json(updatedSession)
  } catch (error) {
    return NextResponse.json({ error: 'TRPG 세션 수정에 실패했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 })
    let sessions = await kv.get<TRPGSession[]>(TRPG_KEY)
    if (!Array.isArray(sessions)) sessions = []
    await kv.set(TRPG_KEY, sessions.filter(s => s.id !== id))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'TRPG 세션 삭제에 실패했습니다.' }, { status: 500 })
  }
}
