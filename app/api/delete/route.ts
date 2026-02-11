import { NextResponse } from 'next/server'
import { kv } from '@/lib/db'
import { DialogueRecord } from '@/lib/parseDialogue'

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    let records = await kv.get<DialogueRecord[]>('emin_dialogue_records') || []
    const newRecords = records.filter(r => r.id !== id)
    await kv.set('emin_dialogue_records', newRecords)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 })
  }
}
