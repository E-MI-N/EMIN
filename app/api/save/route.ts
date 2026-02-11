import { NextResponse } from 'next/server'
import { kv } from '@/lib/db'
import { DialogueRecord } from '@/lib/parseDialogue'

export async function POST(req: Request) {
  try {
    const newRecord = await req.json() as DialogueRecord
    let records = await kv.get<DialogueRecord[]>('emin_dialogue_records')
    if (!records || !Array.isArray(records)) records = []
    const index = records.findIndex(r => r.id === newRecord.id)
    if (index >= 0) {
      records[index] = { ...newRecord, updatedAt: new Date().toISOString() }
    } else {
      records.unshift(newRecord)
    }
    await kv.set('emin_dialogue_records', records)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '저장 실패' }, { status: 500 })
  }
}
