'use client'

import { useState, useEffect } from 'react'
import { parseDialogue, DialogueRecord, DialogueLine, Phase, Section, TRPGSession, TRPGLine, TRPGCharacter } from '@/lib/parseDialogue'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9) }

async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1920; let w = img.width, h = img.height
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX } } else { if (h > MAX) { w *= MAX / h; h = MAX } }
        const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
        canvas.toBlob(async (blob) => {
          if (!blob) { reject(new Error('압축 실패')); return }
          const fd = new FormData(); fd.append('image', blob, file.name)
          try { const r = await fetch('/api/upload-image', { method: 'POST', body: fd }); if (!r.ok) throw new Error(`서버 오류 (${r.status})`); const d = await r.json(); if (!d.path) throw new Error('경로 없음'); resolve(d.path) }
          catch (e: any) { reject(new Error(`업로드 실패: ${e.message}`)) }
        }, 'image/jpeg', 0.8)
      }; img.onerror = () => reject(new Error('이미지 로드 실패')); img.src = reader.result as string
    }; reader.onerror = () => reject(new Error('파일 읽기 실패')); reader.readAsDataURL(file)
  })
}

function parseRoll20HTML(html: string): { lines: TRPGLine[], characters: TRPGCharacter[] } {
  const parser = new DOMParser(); const doc = parser.parseFromString(html, 'text/html')
  const lines: TRPGLine[] = []; const charMap = new Map<string, TRPGCharacter>()
  const messages = doc.querySelectorAll('.message')
  messages.forEach((msg) => {
    const id = generateId(); const cls = msg.className
    if (cls.includes('desc')) {
      const el = msg.cloneNode(true) as HTMLElement; el.querySelectorAll('.spacer,.avatar,.tstamp,.by').forEach(e => e.remove())
      let t = el.innerHTML.trim(); const imgM = t.match(/<img[^>]+src="([^"]+)"/)
      if (imgM) { lines.push({ id, type: 'narration', text: '', images: [imgM[1]] }) }
      else { t = t.replace(/<a[^>]*>([^<]*)<\/a>/g, '$1').replace(/<[^>]+>/g, '').trim(); if (t && t !== '*') { if (msg.innerHTML.includes('background-color')) lines.push({ id, type: 'system', text: t }); else lines.push({ id, type: 'narration', text: t }) } }
      return
    }
    if (cls.includes('general')) {
      const byEl = msg.querySelector('.by'); if (!byEl) return
      let speaker = byEl.textContent?.replace(':', '').trim() || ''; if (!speaker) return
      if (!charMap.has(speaker)) { const colors = ['#E74C3C','#3498DB','#2ECC71','#9B59B6','#F39C12','#1ABC9C','#E91E63','#00BCD4']; charMap.set(speaker, { name: speaker, color: colors[charMap.size % colors.length], isPC: cls.includes('you') }) }
      const el = msg.cloneNode(true) as HTMLElement; el.querySelectorAll('.spacer,.avatar,.tstamp,.by').forEach(e => e.remove())
      const rt = el.querySelector('.sheet-rolltemplate-coc-1')
      if (rt) {
        const caption = rt.querySelector('caption')?.textContent || ''; const vals = rt.querySelectorAll('.sheet-template_value span')
        const target = parseInt(vals[0]?.textContent || '0'); const rolled = parseInt(vals[3]?.textContent || '0')
        const rc = rt.querySelector('tr:last-child td:last-child')?.textContent?.toLowerCase() || ''
        let result: any = 'fail'; if (rc.includes('대성공') || rc.includes('critical')) result = 'critical'; else if (rc.includes('극단적') || rc.includes('extreme')) result = 'extreme'; else if (rc.includes('어려운') || rc.includes('hard')) result = 'hard'; else if (rc.includes('성공') || rc.includes('success')) result = 'success'; else if (rc.includes('대실패') || rc.includes('fumble')) result = 'fumble'
        lines.push({ id, type: 'roll', speaker, text: caption, rollData: { skillName: caption, target, rolled, result } }); return
      }
      let t = el.innerHTML.replace(/<strong>([^<]*)<\/strong>/g, '<b>$1</b>').replace(/<em>([^<]*)<\/em>/g, '<i>$1</i>').replace(/<[^bi/][^>]*>/g, '').replace(/<\/[^bi][^>]*>/g, '').trim()
      if (t) lines.push({ id, type: 'dialogue', speaker, text: t })
    }
  })
  return { lines, characters: Array.from(charMap.values()) }
}

// === 드래그 가능한 말풍선 ===
function SortableLine({ line, onChange, onDelete, onImagesUpload, onImageDelete }: { line: DialogueLine; onChange: (id: string, f: 'speaker'|'text', v: string) => void; onDelete: (id: string) => void; onImagesUpload: (id: string, p: string[]) => void; onImageDelete: (id: string, i: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: line.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const [ci, setCi] = useState(0)
  const handleImgUp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return
    try { const paths: string[] = []; for (let i = 0; i < files.length; i++) { if (!files[i].type.startsWith('image/')) continue; paths.push(await uploadImage(files[i])) }; if (paths.length > 0) onImagesUpload(line.id, paths) } catch (e: any) { alert(`업로드 실패: ${e.message}`) }
  }
  const imgs = line.images || []
  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2 bg-leemin-teal/[0.03] p-3 border border-leemin-teal/10 items-start group">
      <div {...attributes} {...listeners} className="cursor-grab text-leemin-teal/20 hover:text-leemin-teal/50 mt-2 px-1 text-lg">⣿</div>
      <div className="flex-1 space-y-2">
        <input value={line.speaker} onChange={e => onChange(line.id, 'speaker', e.target.value)} className="bg-transparent border-b border-leemin-teal/15 w-24 text-sm text-leemin-teal/70 focus:outline-none focus:border-leemin-teal" />
        {imgs.length > 0 && (
          <div className="relative inline-block">
            <img src={imgs[ci]} alt="" className="max-w-xs border border-leemin-teal/20" />
            {imgs.length > 1 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 px-3 py-1 border border-leemin-teal/20"><button onClick={() => setCi(p => p === 0 ? imgs.length - 1 : p - 1)} className="text-leemin-teal/80 text-sm">←</button><span className="text-leemin-teal/60 text-xs">{ci+1}/{imgs.length}</span><button onClick={() => setCi(p => p === imgs.length - 1 ? 0 : p + 1)} className="text-leemin-teal/80 text-sm">→</button></div>}
            <button onClick={() => { onImageDelete(line.id, ci); setCi(Math.max(0, ci - 1)) }} className="absolute top-1 right-1 bg-red-500/80 text-white w-6 h-6 flex items-center justify-center text-xs">✕</button>
          </div>
        )}
        <textarea value={line.text} onChange={e => onChange(line.id, 'text', e.target.value)} className="w-full bg-black/40 text-leemin-teal/90 text-sm p-2 border border-leemin-teal/10 focus:outline-none resize-none" rows={Math.max(2, line.text.split('\n').length)} />
        <label className="inline-flex items-center gap-2 px-3 py-1 bg-leemin-teal/5 hover:bg-leemin-teal/10 border border-leemin-teal/15 cursor-pointer text-xs text-leemin-teal/60"><span>+ 이미지</span><input type="file" accept="image/*" multiple onChange={handleImgUp} className="hidden" /></label>
      </div>
      <button onClick={() => onDelete(line.id)} className="text-leemin-teal/10 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100">✕</button>
    </div>
  )
}

// === 드래그 가능한 Phase ===
function SortablePhase({ phase, pIdx, selectedPhaseIdx, selectedSectionIdx, onSelectPhase, onSelectSection, onEditPhaseName, onDeletePhase, onAddSection, onEditSectionName, onDeleteSection }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: phase.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const [isEditing, setIsEditing] = useState(false)
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null)
  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab text-leemin-teal/20 hover:text-leemin-teal/50">⣿</div>
        {isEditing ? (
          <input autoFocus value={phase.name} onChange={e => onEditPhaseName(pIdx, e.target.value)} onBlur={() => setIsEditing(false)} onKeyDown={e => e.key === 'Enter' && setIsEditing(false)} className="bg-black/30 text-leemin-teal px-2 py-1 focus:outline-none flex-1 border border-leemin-teal/30" />
        ) : (
          <button onClick={() => onSelectPhase(pIdx)} onDoubleClick={() => setIsEditing(true)} className={`text-left flex-1 ${selectedPhaseIdx === pIdx ? 'text-leemin-teal' : 'text-leemin-teal/40'}`}>{phase.name}</button>
        )}
        <button onClick={() => onDeletePhase(pIdx)} className="text-leemin-teal/20 hover:text-red-500 text-sm">🗑️</button>
      </div>
      <div className="space-y-1 pl-6 border-l border-leemin-teal/10 ml-2">
        {phase.sections.map((s: Section, sIdx: number) => (
          <div key={s.id} className="flex items-center gap-2 group">
            {editingSectionIdx === sIdx ? (
              <input autoFocus value={s.title} onChange={e => onEditSectionName(pIdx, sIdx, e.target.value)} onBlur={() => setEditingSectionIdx(null)} onKeyDown={e => e.key === 'Enter' && setEditingSectionIdx(null)} className="bg-black/30 text-leemin-teal/80 text-sm px-2 py-1 focus:outline-none flex-1 border border-leemin-teal/20" />
            ) : (
              <button onClick={() => onSelectSection(pIdx, sIdx)} onDoubleClick={() => setEditingSectionIdx(sIdx)} className={`text-left text-sm flex-1 py-1 px-2 ${selectedPhaseIdx === pIdx && selectedSectionIdx === sIdx ? 'bg-leemin-teal/10 text-leemin-teal border border-leemin-teal/20' : 'text-leemin-teal/40 hover:bg-leemin-teal/5 border border-transparent'}`}>{s.title}</button>
            )}
            <button onClick={() => onDeleteSection(pIdx, sIdx)} className="text-leemin-teal/20 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => onAddSection(pIdx)} className="ml-8 mt-2 text-sm text-leemin-teal/25 hover:text-leemin-teal/60">+ 소제목 추가</button>
    </div>
  )
}

// === TRPG Line 편집 ===
function TRPGLineEditor({ line, characters, onChange, onDelete }: { line: TRPGLine; characters: TRPGCharacter[]; onChange: (l: TRPGLine) => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: line.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const char = characters.find(c => c.name === line.speaker); const color = char?.color || '#007B80'
  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2 bg-leemin-teal/[0.03] p-3 border border-leemin-teal/10 items-start group">
      <div {...attributes} {...listeners} className="cursor-grab text-leemin-teal/20 hover:text-leemin-teal/50 mt-2 px-1">⣿</div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <select value={line.type} onChange={e => onChange({ ...line, type: e.target.value as any })} className="bg-black/40 text-leemin-teal/70 text-xs px-2 py-1 border border-leemin-teal/15"><option value="dialogue">대사</option><option value="narration">내레이션</option><option value="system">시스템</option><option value="roll">주사위</option></select>
          {(line.type === 'dialogue' || line.type === 'roll') && <input value={line.speaker || ''} onChange={e => onChange({ ...line, speaker: e.target.value })} className="bg-transparent border-b border-leemin-teal/15 w-32 text-sm focus:outline-none" style={{ color }} placeholder="화자" />}
        </div>
        <textarea value={line.text} onChange={e => onChange({ ...line, text: e.target.value })} className="w-full bg-black/40 text-leemin-teal/90 text-sm p-2 border border-leemin-teal/10 focus:outline-none resize-none" rows={Math.max(1, line.text.split('\n').length)} placeholder="내용" />
      </div>
      <button onClick={onDelete} className="text-leemin-teal/10 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100">✕</button>
    </div>
  )
}

// === 컬러 피커 ===
function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const presets = ['#E74C3C','#3498DB','#2ECC71','#9B59B6','#F39C12','#1ABC9C','#E91E63','#00BCD4','#FF5722','#795548','#607D8B','#8BC34A']
  return <div className="flex flex-wrap gap-1">{presets.map(c => <button key={c} onClick={() => onChange(c)} className={`w-6 h-6 border-2 ${color === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}<input type="color" value={color} onChange={e => onChange(e.target.value)} className="w-6 h-6 cursor-pointer" /></div>
}

// === 메인 어드민 ===
export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'roleplay' | 'trpg'>('roleplay')
  const [message, setMessage] = useState('')
  const [recordsList, setRecordsList] = useState<DialogueRecord[]>([])
  const [editingRecord, setEditingRecord] = useState<DialogueRecord | null>(null)
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0)
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0)
  const [trpgList, setTrpgList] = useState<TRPGSession[]>([])
  const [editingTRPG, setEditingTRPG] = useState<TRPGSession | null>(null)

  useEffect(() => { const s = localStorage.getItem('leemin_admin_login'); if (s === 'true') setIsLoggedIn(true); setIsLoading(false) }, [])
  useEffect(() => { if (isLoggedIn) { fetchRecords(); fetchTRPG() } }, [isLoggedIn])

  const fetchRecords = async () => { try { const r = await fetch('/api/records'); const d = await r.json(); if (Array.isArray(d)) setRecordsList(d) } catch (e) { console.error(e) } }
  const fetchTRPG = async () => { try { const r = await fetch('/api/trpg'); const d = await r.json(); if (Array.isArray(d)) setTrpgList(d) } catch (e) { console.error(e) } }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: 'new' | 'append') => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { const text = ev.target?.result as string; const parsed = parseDialogue(text, file.name.replace('.txt', '')); if (mode === 'new') { setEditingRecord(parsed); setSelectedPhaseIdx(0); setSelectedSectionIdx(0) } else if (editingRecord) { const n = { ...editingRecord }; parsed.phases.forEach(p => n.phases.push(p)); setEditingRecord(n) } }
    reader.readAsText(file); e.target.value = ''
  }

  const handleSaveRecord = async () => {
    if (!editingRecord) return; setMessage('저장 중...')
    try { const exists = recordsList.some(r => r.id === editingRecord.id); const res = await fetch('/api/records', { method: exists ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingRecord) }); if (res.ok) { setMessage('저장 완료!'); fetchRecords() } } catch (e) { setMessage('저장 실패') }
    setTimeout(() => setMessage(''), 2000)
  }

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => { e.stopPropagation(); if (!confirm('삭제하시겠습니까?')) return; await fetch(`/api/records?id=${id}`, { method: 'DELETE' }); fetchRecords(); if (editingRecord?.id === id) setEditingRecord(null) }

  const handleLineChange = (id: string, f: 'speaker'|'text', v: string) => { if (!editingRecord) return; const n = { ...editingRecord }; const l = n.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.find(l => l.id === id); if (l) (l as any)[f] = v; setEditingRecord(n) }
  const handleLineDelete = (id: string) => { if (!editingRecord) return; const n = { ...editingRecord }; n.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines = n.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.filter(l => l.id !== id); setEditingRecord(n) }
  const handleImagesUpload = (id: string, paths: string[]) => { if (!editingRecord) return; const n = { ...editingRecord }; const l = n.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.find(l => l.id === id); if (l) l.images = [...(l.images || []), ...paths]; setEditingRecord(n) }
  const handleImageDelete = (id: string, idx: number) => { if (!editingRecord) return; const n = { ...editingRecord }; const l = n.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.find(l => l.id === id); if (l?.images) l.images.splice(idx, 1); setEditingRecord(n) }

  const handleDragEnd = (event: DragEndEvent) => { if (!editingRecord) return; const { active, over } = event; if (!over || active.id === over.id) return; const lines = editingRecord.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines; const oi = lines.findIndex(l => l.id === active.id); const ni = lines.findIndex(l => l.id === over.id); if (oi !== -1 && ni !== -1) { const n = { ...editingRecord }; n.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines = arrayMove(lines, oi, ni); setEditingRecord(n) } }

  const handleTRPGUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const { lines, characters } = parseRoll20HTML(ev.target?.result as string)
      const fn = file.name.replace('.html', ''); const dm = fn.match(/^(\d{8})_/)
      const date = dm ? `${dm[1].slice(0,4)}.${dm[1].slice(4,6)}.${dm[1].slice(6,8)}` : ''
      const title = dm ? fn.replace(dm[0], '').replace(/_/g, ' ') : fn
      setEditingTRPG({ id: generateId(), title, date, characters, lines, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }; reader.readAsText(file); e.target.value = ''
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file || !editingTRPG) return; try { const path = await uploadImage(file); setEditingTRPG({ ...editingTRPG, coverImage: path }) } catch (e: any) { alert(`업로드 실패: ${e.message}`) } }

  const handleSaveTRPG = async () => {
    if (!editingTRPG) return; setMessage('저장 중...')
    try { const exists = trpgList.some(s => s.id === editingTRPG.id); const res = await fetch('/api/trpg', { method: exists ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingTRPG) }); if (res.ok) { setMessage('저장 완료!'); fetchTRPG() } } catch (e) { setMessage('저장 실패') }
    setTimeout(() => setMessage(''), 2000)
  }

  const handleDeleteTRPG = async (id: string, e: React.MouseEvent) => { e.stopPropagation(); if (!confirm('삭제하시겠습니까?')) return; await fetch(`/api/trpg?id=${id}`, { method: 'DELETE' }); fetchTRPG(); if (editingTRPG?.id === id) setEditingTRPG(null) }

  const handleTRPGLineChange = (idx: number, line: TRPGLine) => { if (!editingTRPG) return; const nl = [...editingTRPG.lines]; nl[idx] = line; setEditingTRPG({ ...editingTRPG, lines: nl }) }
  const handleTRPGLineDragEnd = (event: DragEndEvent) => { if (!editingTRPG) return; const { active, over } = event; if (!over || active.id === over.id) return; const oi = editingTRPG.lines.findIndex(l => l.id === active.id); const ni = editingTRPG.lines.findIndex(l => l.id === over.id); if (oi !== -1 && ni !== -1) setEditingTRPG({ ...editingTRPG, lines: arrayMove(editingTRPG.lines, oi, ni) }) }
  const handleCharacterColorChange = (name: string, color: string) => { if (!editingTRPG) return; setEditingTRPG({ ...editingTRPG, characters: editingTRPG.characters.map(c => c.name === name ? { ...c, color } : c) }) }
  const handleCharacterPCToggle = (name: string) => { if (!editingTRPG) return; setEditingTRPG({ ...editingTRPG, characters: editingTRPG.characters.map(c => c.name === name ? { ...c, isPC: !c.isPC } : c) }) }

  if (isLoading) return <div className="min-h-screen bg-black" />

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black border-2 border-leemin-teal p-8">
          <h1 className="text-center text-leemin-teal mb-6 text-xl tracking-[0.3em]">ADMIN_ACCESS</h1>
          <form onSubmit={e => { e.preventDefault(); if (password === "leemin1234") { setIsLoggedIn(true); localStorage.setItem('leemin_admin_login', 'true') } else alert('ACCESS DENIED') }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-leemin-teal/10 border border-leemin-teal px-4 py-3 text-leemin-teal focus:outline-none mb-4" placeholder="ENTER_PASS" />
            <button type="submit" className="w-full border border-leemin-teal py-3 hover:bg-leemin-teal hover:text-black transition-all tracking-widest">RUN_SEQUENCE</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-leemin-teal overflow-hidden">
      {/* 사이드바 */}
      <div className="w-80 bg-black border-r border-leemin-teal/15 flex flex-col">
        <div className="p-6 border-b border-leemin-teal/15">
          <h1 className="text-xl tracking-[0.3em] mb-4">ADMIN</h1>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('roleplay')} className={`flex-1 py-2 text-sm tracking-widest border ${activeTab === 'roleplay' ? 'bg-leemin-teal/15 border-leemin-teal text-leemin-teal' : 'bg-transparent border-leemin-teal/15 text-leemin-teal/40'}`}>역극</button>
            <button onClick={() => setActiveTab('trpg')} className={`flex-1 py-2 text-sm tracking-widest border ${activeTab === 'trpg' ? 'bg-leemin-teal/15 border-leemin-teal text-leemin-teal' : 'bg-transparent border-leemin-teal/15 text-leemin-teal/40'}`}>TRPG</button>
          </div>
          {activeTab === 'roleplay' ? (
            <div className="space-y-2">
              <label className="flex items-center justify-center w-full bg-leemin-teal/5 hover:bg-leemin-teal/10 py-3 cursor-pointer border border-dashed border-leemin-teal/30 text-sm"><span>+ 새 파일로 시작</span><input type="file" className="hidden" accept=".txt" onChange={e => handleFileUpload(e, 'new')} /></label>
              {editingRecord && <label className="flex items-center justify-center w-full bg-leemin-teal/10 py-3 cursor-pointer border border-leemin-teal/30 text-sm"><span>+ 현재 레코드에 추가</span><input type="file" className="hidden" accept=".txt" onChange={e => handleFileUpload(e, 'append')} /></label>}
            </div>
          ) : (
            <label className="flex items-center justify-center w-full bg-leemin-teal/5 hover:bg-leemin-teal/10 py-3 cursor-pointer border border-dashed border-leemin-teal/30 text-sm"><span>+ Roll20 HTML 업로드</span><input type="file" className="hidden" accept=".html" onChange={handleTRPGUpload} /></label>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'roleplay' ? recordsList.map(rec => (
            <div key={rec.id} onClick={() => { setEditingRecord(rec); setSelectedPhaseIdx(0); setSelectedSectionIdx(0) }}
              className={`group p-3 cursor-pointer flex justify-between items-center border ${editingRecord?.id === rec.id ? 'bg-leemin-teal/10 border-leemin-teal/40' : 'hover:bg-leemin-teal/5 border-transparent'}`}>
              <div className="truncate"><div className="text-sm truncate">{rec.title}</div><div className="text-xs text-leemin-teal/30">{new Date(rec.createdAt).toLocaleDateString()}</div></div>
              <button onClick={e => handleDeleteRecord(rec.id, e)} className="text-leemin-teal/20 hover:text-red-500 px-2 opacity-0 group-hover:opacity-100">🗑️</button>
            </div>
          )) : trpgList.map(s => (
            <div key={s.id} onClick={() => setEditingTRPG(s)}
              className={`group p-3 cursor-pointer flex justify-between items-center border ${editingTRPG?.id === s.id ? 'bg-leemin-teal/10 border-leemin-teal/40' : 'hover:bg-leemin-teal/5 border-transparent'}`}>
              <div className="truncate"><div className="text-sm truncate">{s.title}</div><div className="text-xs text-leemin-teal/30">{s.date || new Date(s.createdAt).toLocaleDateString()}</div></div>
              <button onClick={e => handleDeleteTRPG(s.id, e)} className="text-leemin-teal/20 hover:text-red-500 px-2 opacity-0 group-hover:opacity-100">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 에디터 */}
      <div className="flex-1 flex flex-col bg-black h-full overflow-hidden">
        {activeTab === 'roleplay' ? (
          editingRecord ? (
            <>
              <div className="h-16 border-b border-leemin-teal/15 flex items-center justify-between px-6 bg-leemin-teal/[0.02]">
                <input value={editingRecord.title} onChange={e => setEditingRecord({...editingRecord, title: e.target.value})} className="bg-transparent text-lg text-leemin-teal focus:outline-none w-1/2" />
                <div className="flex items-center gap-4"><span className="text-sm">{message}</span><button onClick={handleSaveRecord} className="bg-leemin-teal/15 hover:bg-leemin-teal/30 border border-leemin-teal text-leemin-teal px-6 py-2 tracking-widest">저장</button></div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-64 bg-black border-r border-leemin-teal/10 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4">
                    <DndContext collisionDetection={closestCenter} onDragEnd={e => { const { active, over } = e; if (!over || active.id === over.id) return; const p = editingRecord.phases; const oi = p.findIndex(p => p.id === active.id); const ni = p.findIndex(p => p.id === over.id); if (oi !== -1 && ni !== -1) setEditingRecord({ ...editingRecord, phases: arrayMove(p, oi, ni) }) }}>
                      <SortableContext items={editingRecord.phases.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        {editingRecord.phases.map((phase, pIdx) => (
                          <SortablePhase key={phase.id} phase={phase} pIdx={pIdx} selectedPhaseIdx={selectedPhaseIdx} selectedSectionIdx={selectedSectionIdx}
                            onSelectPhase={(i: number) => { setSelectedPhaseIdx(i); setSelectedSectionIdx(0) }} onSelectSection={(pi: number, si: number) => { setSelectedPhaseIdx(pi); setSelectedSectionIdx(si) }}
                            onEditPhaseName={(pi: number, n: string) => { const r = {...editingRecord}; r.phases[pi].name = n; setEditingRecord(r) }}
                            onDeletePhase={(pi: number) => { const r = {...editingRecord}; r.phases.splice(pi, 1); setEditingRecord(r) }}
                            onAddSection={(pi: number) => { const r = {...editingRecord}; r.phases[pi].sections.push({ id: generateId(), title: '새 소제목', lines: [] }); setEditingRecord(r) }}
                            onEditSectionName={(pi: number, si: number, n: string) => { const r = {...editingRecord}; r.phases[pi].sections[si].title = n; setEditingRecord(r) }}
                            onDeleteSection={(pi: number, si: number) => { const r = {...editingRecord}; r.phases[pi].sections.splice(si, 1); setEditingRecord(r) }}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                  <div className="p-4 border-t border-leemin-teal/10">
                    <button onClick={() => { const r = {...editingRecord}; r.phases.push({ id: generateId(), name: '새 차수', sections: [] }); setEditingRecord(r) }} className="w-full py-3 border border-dashed border-leemin-teal/20 text-leemin-teal/25 hover:text-leemin-teal/60">+ 차수 추가</button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-black">
                  <div className="max-w-3xl mx-auto pb-20">
                    <h2 className="text-xl text-leemin-teal/80 mb-6 pb-4 border-b border-leemin-teal/10">
                      {editingRecord.phases[selectedPhaseIdx]?.name} — {editingRecord.phases[selectedPhaseIdx]?.sections[selectedSectionIdx]?.title}
                    </h2>
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={editingRecord.phases[selectedPhaseIdx]?.sections[selectedSectionIdx]?.lines?.map(l => l.id) || []} strategy={verticalListSortingStrategy}>
                        {editingRecord.phases[selectedPhaseIdx]?.sections[selectedSectionIdx]?.lines?.map(l => <SortableLine key={l.id} line={l} onChange={handleLineChange} onDelete={handleLineDelete} onImagesUpload={handleImagesUpload} onImageDelete={handleImageDelete} />)}
                      </SortableContext>
                    </DndContext>
                    <button onClick={() => { const r = {...editingRecord}; r.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.push({ id: generateId(), speaker: '', text: '' }); setEditingRecord(r) }} className="w-full py-4 mt-4 border border-dashed border-leemin-teal/10 text-leemin-teal/20 hover:text-leemin-teal/50">+ 대사 추가</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-leemin-teal/30 gap-4"><div className="text-4xl">📝</div><p>파일을 불러오거나 목록에서 선택하세요.</p></div>
          )
        ) : (
          editingTRPG ? (
            <>
              <div className="h-16 border-b border-leemin-teal/15 flex items-center justify-between px-6 bg-leemin-teal/[0.02]">
                <input value={editingTRPG.title} onChange={e => setEditingTRPG({...editingTRPG, title: e.target.value})} className="bg-transparent text-lg text-leemin-teal focus:outline-none w-1/3" placeholder="세션 제목" />
                <input value={editingTRPG.date || ''} onChange={e => setEditingTRPG({...editingTRPG, date: e.target.value})} className="bg-transparent text-sm text-leemin-teal/60 focus:outline-none w-32" placeholder="YYYY.MM.DD" />
                <div className="flex items-center gap-4"><span className="text-sm">{message}</span><button onClick={handleSaveTRPG} className="bg-leemin-teal/15 hover:bg-leemin-teal/30 border border-leemin-teal text-leemin-teal px-6 py-2 tracking-widest">저장</button></div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-72 bg-black border-r border-leemin-teal/10 overflow-y-auto p-4">
                  <div className="mb-6">
                    <h3 className="text-sm text-leemin-teal/60 mb-2">세션 카드</h3>
                    {editingTRPG.coverImage ? (
                      <div className="relative"><img src={editingTRPG.coverImage} className="w-full border border-leemin-teal/20" /><button onClick={() => setEditingTRPG({...editingTRPG, coverImage: undefined})} className="absolute top-1 right-1 bg-red-500/80 text-white w-6 h-6 text-xs">✕</button></div>
                    ) : (
                      <label className="flex items-center justify-center w-full aspect-video bg-leemin-teal/[0.03] border border-dashed border-leemin-teal/20 cursor-pointer hover:bg-leemin-teal/5"><span className="text-leemin-teal/40 text-sm">+ 커버 이미지</span><input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} /></label>
                    )}
                  </div>
                  <h3 className="text-sm text-leemin-teal/60 mb-3">캐릭터 ({editingTRPG.characters.length})</h3>
                  <div className="space-y-3">
                    {editingTRPG.characters.map(char => (
                      <div key={char.name} className="p-3 bg-leemin-teal/[0.03] border border-leemin-teal/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 flex items-center justify-center text-sm border" style={{ backgroundColor: `${char.color}20`, color: char.color, borderColor: `${char.color}40` }}>{char.name.charAt(0)}</div>
                          <span className="text-leemin-teal/80 text-sm flex-1">{char.name}</span>
                          <button onClick={() => handleCharacterPCToggle(char.name)} className={`text-xs px-2 py-1 border ${char.isPC ? 'bg-leemin-teal/20 border-leemin-teal/50 text-leemin-teal' : 'bg-leemin-teal/5 border-leemin-teal/15 text-leemin-teal/40'}`}>{char.isPC ? 'PC' : 'NPC'}</button>
                        </div>
                        <ColorPicker color={char.color} onChange={c => handleCharacterColorChange(char.name, c)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-black">
                  <div className="max-w-3xl mx-auto pb-20">
                    <h2 className="text-xl text-leemin-teal/80 mb-6 pb-4 border-b border-leemin-teal/10">로그 편집 ({editingTRPG.lines.length}줄)</h2>
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleTRPGLineDragEnd}>
                      <SortableContext items={editingTRPG.lines.map(l => l.id)} strategy={verticalListSortingStrategy}>
                        {editingTRPG.lines.map((line, idx) => <TRPGLineEditor key={line.id} line={line} characters={editingTRPG.characters} onChange={l => handleTRPGLineChange(idx, l)} onDelete={() => { const ls = [...editingTRPG.lines]; ls.splice(idx, 1); setEditingTRPG({...editingTRPG, lines: ls}) }} />)}
                      </SortableContext>
                    </DndContext>
                    <button onClick={() => setEditingTRPG({...editingTRPG, lines: [...editingTRPG.lines, { id: generateId(), type: 'dialogue', speaker: '', text: '' }]})} className="w-full py-4 mt-4 border border-dashed border-leemin-teal/10 text-leemin-teal/20 hover:text-leemin-teal/50">+ 라인 추가</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-leemin-teal/30 gap-4"><div className="text-4xl">🎲</div><p>Roll20 HTML 파일을 업로드하거나 목록에서 선택하세요.</p></div>
          )
        )}
      </div>
    </div>
  )
}
