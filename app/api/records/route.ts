import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'
import { DialogueRecord } from '@/lib/parseDialogue'

export const dynamic = 'force-dynamic'
const RECORDS_KEY = 'emin_dialogue_records'

export async function GET() {
  try {
    const records = await kv.get<DialogueRecord[]>(RECORDS_KEY) || []
    return NextResponse.json(records)
  } catch (error) {
    console.error('Failed to fetch records:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const record: DialogueRecord = await request.json()
    let records = await kv.get<DialogueRecord[]>(RECORDS_KEY)
    if (!Array.isArray(records)) records = []
    records.unshift(record)
    await kv.set(RECORDS_KEY, records)
    return NextResponse.json(record)
  } catch (error) {
    console.error('Failed to create record:', error)
    return NextResponse.json({ error: '기록 저장에 실패했습니다.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedRecord: DialogueRecord = await request.json()
    updatedRecord.updatedAt = new Date().toISOString()
    let records = await kv.get<DialogueRecord[]>(RECORDS_KEY)
    if (!Array.isArray(records)) records = []
    const index = records.findIndex(r => r.id === updatedRecord.id)
    if (index === -1) return NextResponse.json({ error: '기록을 찾을 수 없습니다.' }, { status: 404 })
    records[index] = updatedRecord
    await kv.set(RECORDS_KEY, records)
    return NextResponse.json(updatedRecord)
  } catch (error) {
    return NextResponse.json({ error: '기록 수정에 실패했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 })
    let records = await kv.get<DialogueRecord[]>(RECORDS_KEY)
    if (!Array.isArray(records)) records = []
    const filteredRecords = records.filter(r => r.id !== id)
    await kv.set(RECORDS_KEY, filteredRecords)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '기록 삭제에 실패했습니다.' }, { status: 500 })
  }
}
