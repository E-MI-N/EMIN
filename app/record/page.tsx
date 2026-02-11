'use client'

import { useState, useEffect } from 'react'
import { DialogueRecord, Phase, Section, DialogueLine, TRPGSession, TRPGLine, TRPGCharacter } from '@/lib/parseDialogue'

// === 이미지 갤러리 모달 ===
function ImageGalleryModal({ images, initialIndex, onClose }: { images: { src: string; speaker?: string }[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') setCurrentIndex(p => p === 0 ? images.length - 1 : p - 1); if (e.key === 'ArrowRight') setCurrentIndex(p => p === images.length - 1 ? 0 : p + 1) }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [images.length, onClose])
  const c = images[currentIndex]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img src={c.src} alt={c.speaker || '이미지'} className="max-w-full max-h-[90vh] object-contain" />
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-leemin-teal/10 hover:bg-leemin-teal/20 text-leemin-teal/80 hover:text-leemin-teal transition-colors border border-leemin-teal/30">✕</button>
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrentIndex(p => p === 0 ? images.length - 1 : p - 1)} className="absolute left-4 z-20 w-12 h-12 flex items-center justify-center bg-leemin-teal/10 hover:bg-leemin-teal/20 text-leemin-teal/80 border border-leemin-teal/30">←</button>
          <button onClick={() => setCurrentIndex(p => p === images.length - 1 ? 0 : p + 1)} className="absolute right-4 z-20 w-12 h-12 flex items-center justify-center bg-leemin-teal/10 hover:bg-leemin-teal/20 text-leemin-teal/80 border border-leemin-teal/30">→</button>
        </>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 border border-leemin-teal/20 px-4 py-2">
        <p className="text-leemin-teal/80 text-sm">{c.speaker && <span className="text-leemin-teal/60">{c.speaker}</span>}{images.length > 1 && <span className="text-leemin-teal/50 ml-2">{currentIndex + 1} / {images.length}</span>}</p>
      </div>
    </div>
  )
}

// === 역극 말풍선 ===
function DialogueBubble({ line, onImageClick }: { line: DialogueLine; onImageClick?: (idx: number) => void }) {
  const [ci, setCi] = useState(0)
  const isRight = line.speaker.charCodeAt(0) % 2 === 0
  const images = line.images || []
  return (
    <div className={`flex gap-3 mb-4 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-10 h-10 flex items-center justify-center text-lg shrink-0 bg-leemin-teal/10 text-leemin-teal/60 border border-leemin-teal/20">
        {line.speaker?.charAt(0) || '?'}
      </div>
      <div className="max-w-[75%]">
        <div className={`mb-1 ${isRight ? 'text-right' : 'text-left'}`}>
          <span className="text-xs text-leemin-teal/70">{line.speaker}</span>
        </div>
        <div className={`px-4 py-3 bg-leemin-teal/[0.06] border border-leemin-teal/10 ${isRight ? 'border-r-2 border-r-leemin-teal/30' : 'border-l-2 border-l-leemin-teal/30'}`}>
          {images.length > 0 && (
            <div className="mb-2 relative">
              <img src={images[ci]} alt="" className="max-w-full cursor-pointer hover:opacity-90 transition-opacity border border-leemin-teal/20" onClick={() => onImageClick && onImageClick(ci)} />
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 border border-leemin-teal/20 px-3 py-1">
                  <button onClick={e => { e.stopPropagation(); setCi(p => p === 0 ? images.length - 1 : p - 1) }} className="text-leemin-teal/80 text-sm">←</button>
                  <span className="text-leemin-teal/60 text-xs">{ci + 1}/{images.length}</span>
                  <button onClick={e => { e.stopPropagation(); setCi(p => p === images.length - 1 ? 0 : p + 1) }} className="text-leemin-teal/80 text-sm">→</button>
                </div>
              )}
            </div>
          )}
          {line.text && <p className="text-leemin-teal/80 text-sm leading-relaxed whitespace-pre-wrap">{line.text}</p>}
        </div>
      </div>
    </div>
  )
}

// === TRPG 말풍선 ===
function TRPGBubble({ line, characters, onImageClick }: { line: TRPGLine; characters: TRPGCharacter[]; onImageClick?: (idx: number) => void }) {
  const [ci, setCi] = useState(0)
  const character = characters.find(c => c.name === line.speaker)
  const color = character?.color || '#007B80'
  const isRight = character?.isPC
  const images = line.images || []

  if (line.type === 'narration') return (
    <div className="my-4 px-6 py-3 text-center">
      <p className="text-leemin-teal/60 text-sm italic leading-relaxed" dangerouslySetInnerHTML={{ __html: line.text }} />
    </div>
  )

  if (line.type === 'roll' && line.rollData) {
    const { skillName, target, rolled, result } = line.rollData
    const rC: Record<string, string> = { critical: 'bg-yellow-500', extreme: 'bg-green-500', hard: 'bg-green-400', success: 'bg-leemin-teal', fail: 'bg-red-500', fumble: 'bg-red-700' }
    const rT: Record<string, string> = { critical: '대성공', extreme: '극단적 성공', hard: '어려운 성공', success: '성공', fail: '실패', fumble: '대실패' }
    return (
      <div className="my-3 flex justify-center">
        <div className="bg-black border border-leemin-teal/20 p-3 min-w-[200px]">
          <div className="text-center text-leemin-teal/60 text-xs mb-2">{line.speaker}</div>
          <div className="text-center text-leemin-teal/80 mb-2">{skillName}</div>
          <div className="flex items-center justify-center gap-4 text-sm"><span className="text-leemin-teal/50">목표: {target}</span><span className="text-leemin-teal font-bold">{rolled}</span></div>
          <div className={`mt-2 text-center text-white text-xs py-1 px-2 ${rC[result]}`}>{rT[result]}</div>
        </div>
      </div>
    )
  }

  if (line.type === 'system') return (
    <div className="my-3 flex justify-center">
      <div className="bg-leemin-teal/10 border border-leemin-teal/30 px-4 py-2">
        <p className="text-leemin-teal text-sm text-center" dangerouslySetInnerHTML={{ __html: line.text }} />
      </div>
    </div>
  )

  return (
    <div className={`flex gap-3 mb-4 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-10 h-10 flex items-center justify-center text-lg shrink-0 border" style={{ backgroundColor: `${color}15`, color, borderColor: `${color}40` }}>
        {line.speaker?.charAt(0) || '?'}
      </div>
      <div className="max-w-[75%]">
        <div className={`mb-1 ${isRight ? 'text-right' : 'text-left'}`}><span className="text-xs" style={{ color }}>{line.speaker}</span></div>
        <div className={`px-4 py-3 border ${isRight ? 'border-r-2' : 'border-l-2'}`} style={{ backgroundColor: `${color}08`, borderColor: `${color}20`, borderLeftColor: isRight ? undefined : color, borderRightColor: isRight ? color : undefined }}>
          {images.length > 0 && (
            <div className="mb-2 relative">
              <img src={images[ci]} alt="" className="max-w-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onImageClick && onImageClick(ci)} />
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 px-3 py-1 border border-leemin-teal/20">
                  <button onClick={e => { e.stopPropagation(); setCi(p => p === 0 ? images.length - 1 : p - 1) }} className="text-leemin-teal/80 text-sm">←</button>
                  <span className="text-leemin-teal/60 text-xs">{ci + 1}/{images.length}</span>
                  <button onClick={e => { e.stopPropagation(); setCi(p => p === images.length - 1 ? 0 : p + 1) }} className="text-leemin-teal/80 text-sm">→</button>
                </div>
              )}
            </div>
          )}
          {line.text && <p className="text-leemin-teal/80 text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: line.text }} />}
        </div>
      </div>
    </div>
  )
}

// === 섹션 카드 ===
function SectionCard({ section, onClick }: { section: Section; onClick: () => void }) {
  const previewLines = section.lines.slice(0, 2)
  return (
    <button onClick={onClick} className="w-full text-left p-5 bg-leemin-teal/[0.02] border border-leemin-teal/10 hover:bg-leemin-teal/[0.06] hover:border-leemin-teal/30 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg text-leemin-teal/80 group-hover:text-leemin-teal transition-colors">{section.title}</h3>
      </div>
      <div className="space-y-2">
        {previewLines.map(l => (
          <div key={l.id} className="text-sm truncate">
            <span className="text-leemin-teal/60 mr-2">{l.speaker}</span>
            <span className="text-leemin-teal/30">{l.text ? (l.text.length > 30 ? l.text.slice(0, 30) + '...' : l.text) : (l.images ? '(이미지)' : '')}</span>
          </div>
        ))}
        {section.lines.length > 2 && <p className="text-leemin-teal/20 text-xs mt-2 pt-2 border-t border-leemin-teal/5">+{section.lines.length - 2}개 더보기</p>}
      </div>
    </button>
  )
}

// === TRPG 세션 카드 ===
function TRPGSessionCard({ session, onClick }: { session: TRPGSession; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left bg-leemin-teal/[0.02] border border-leemin-teal/10 hover:bg-leemin-teal/[0.06] hover:border-leemin-teal/30 transition-all group overflow-hidden">
      {session.coverImage && (
        <div className="aspect-[16/9] overflow-hidden"><img src={session.coverImage} alt={session.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" /></div>
      )}
      <div className="p-4">
        <h3 className="text-lg text-leemin-teal/80 group-hover:text-leemin-teal transition-colors mb-1">{session.title}</h3>
        {session.date && <p className="text-leemin-teal/30 text-xs mb-2">{session.date}</p>}
        <div className="flex flex-wrap gap-1">
          {session.characters.slice(0, 4).map((char, i) => (
            <span key={i} className="text-xs px-2 py-0.5 border" style={{ backgroundColor: `${char.color}15`, color: char.color, borderColor: `${char.color}30` }}>{char.name}</span>
          ))}
        </div>
      </div>
    </button>
  )
}

// === 섹션 상세 모달 ===
function SectionModal({ section, onClose, onImageClick }: { section: Section; onClose: () => void; onImageClick: (li: number, ii: number) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-black border border-leemin-teal/30 overflow-hidden shadow-2xl flex flex-col">
        <div className="shrink-0 bg-black border-b border-leemin-teal/20 p-5 flex items-center justify-between">
          <h2 className="text-xl text-leemin-teal/90">{section.title}</h2>
          <button onClick={onClose} className="text-leemin-teal/40 hover:text-leemin-teal/80 transition-colors p-2">✕</button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-black/50">
          {section.lines.length === 0 ? <p className="text-leemin-teal/40 text-center py-10">대사가 없습니다.</p> : (
            <div className="space-y-1">{section.lines.map((line, i) => <DialogueBubble key={line.id} line={line} onImageClick={(ii) => onImageClick(i, ii)} />)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

// === TRPG 세션 모달 ===
function TRPGSessionModal({ session, onClose, onImageClick }: { session: TRPGSession; onClose: () => void; onImageClick: (li: number, ii: number) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-black border border-leemin-teal/30 overflow-hidden shadow-2xl flex flex-col">
        <div className="shrink-0 bg-black border-b border-leemin-teal/20 p-5 flex items-center justify-between">
          <div><h2 className="text-xl text-leemin-teal/90">{session.title}</h2>{session.date && <p className="text-leemin-teal/40 text-sm mt-1">{session.date}</p>}</div>
          <button onClick={onClose} className="text-leemin-teal/40 hover:text-leemin-teal/80 transition-colors p-2">✕</button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-black/50">
          {session.lines.length === 0 ? <p className="text-leemin-teal/40 text-center py-10">로그가 없습니다.</p> : (
            <div className="space-y-1">{session.lines.map((line, i) => <TRPGBubble key={line.id} line={line} characters={session.characters} onImageClick={(ii) => onImageClick(i, ii)} />)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

// === 메인 페이지 ===
export default function RecordPage() {
  const [activeMainTab, setActiveMainTab] = useState<'roleplay' | 'trpg'>('roleplay')
  const [records, setRecords] = useState<DialogueRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<DialogueRecord | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [trpgSessions, setTrpgSessions] = useState<TRPGSession[]>([])
  const [selectedTRPGSession, setSelectedTRPGSession] = useState<TRPGSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [galleryImages, setGalleryImages] = useState<{ src: string; speaker?: string }[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => { fetchRecords(); fetchTRPGSessions() }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data)) { setRecords(data); if (data.length > 0) { setSelectedRecord(data[0]); if (data[0].phases.length > 0) setSelectedPhase(data[0].phases[0]) } }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const fetchTRPGSessions = async () => {
    try { const res = await fetch('/api/trpg', { cache: 'no-store' }); const data = await res.json(); if (Array.isArray(data)) setTrpgSessions(data) } catch (e) { console.error(e) }
  }

  const handleRecordChange = (r: DialogueRecord) => { setSelectedRecord(r); setSelectedPhase(r.phases.length > 0 ? r.phases[0] : null) }

  const collectImages = (lines: (DialogueLine | TRPGLine)[], lineIndex: number, imageIndex: number) => {
    const all: { src: string; speaker?: string }[] = []; let clickedIdx = 0; let cur = 0
    lines.forEach((l, li) => { if (l.images) l.images.forEach((img, ii) => { all.push({ src: img, speaker: 'speaker' in l ? l.speaker : '' }); if (li === lineIndex && ii === imageIndex) clickedIdx = cur; cur++ }) })
    setGalleryImages(all); setGalleryIndex(clickedIdx); setShowGallery(true)
  }

  return (
    <div className="min-h-screen bg-black text-leemin-teal">
      <header className="border-b border-leemin-teal/10 p-10 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-leemin-teal/5 to-transparent" />
        <div className="relative z-10">
          <span className="text-xs text-leemin-teal/40 tracking-wider block mb-2">03</span>
          <h1 className="text-4xl md:text-5xl tracking-[0.3em] mt-2">RECORD</h1>
          <p className="text-leemin-teal/45 mt-2">기록</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* 탭 */}
        <div className="flex gap-2 mb-8">
          {(['roleplay', 'trpg'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveMainTab(tab)}
              className={`px-6 py-3 tracking-widest transition-all border ${activeMainTab === tab ? 'bg-leemin-teal/15 border-leemin-teal text-leemin-teal' : 'bg-leemin-teal/[0.02] border-leemin-teal/10 text-leemin-teal/35 hover:bg-leemin-teal/5'}`}>
              {tab === 'roleplay' ? '러닝 중 역극' : 'TRPG'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20"><span className="animate-pulse text-2xl">LOADING...</span></div>
        ) : activeMainTab === 'roleplay' ? (
          records.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-leemin-teal/15"><p className="text-leemin-teal/40">아직 기록이 없습니다.</p><p className="text-leemin-teal/25 text-sm mt-2">어드민에서 대화 기록을 추가해주세요.</p></div>
          ) : (
            <>
              {records.length > 1 && (
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                  {records.map(r => (
                    <button key={r.id} onClick={() => handleRecordChange(r)}
                      className={`px-4 py-2 text-sm whitespace-nowrap transition-all border ${selectedRecord?.id === r.id ? 'bg-leemin-teal/15 text-leemin-teal border-leemin-teal' : 'bg-leemin-teal/[0.02] text-leemin-teal/35 border-leemin-teal/10 hover:bg-leemin-teal/5'}`}>
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
              {selectedRecord && (
                <div className="animate-fade-in">
                  <div className="flex border-b border-leemin-teal/10 mb-8 overflow-x-auto">
                    {selectedRecord.phases.map(p => (
                      <button key={p.id} onClick={() => setSelectedPhase(p)}
                        className={`px-6 py-3 text-sm transition-colors relative whitespace-nowrap ${selectedPhase?.id === p.id ? 'text-leemin-teal' : 'text-leemin-teal/35 hover:text-leemin-teal/60'}`}>
                        {p.name}
                        {selectedPhase?.id === p.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-leemin-teal" />}
                      </button>
                    ))}
                  </div>
                  {selectedPhase && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedPhase.sections.map(s => <SectionCard key={s.id} section={s} onClick={() => setSelectedSection(s)} />)}
                      </div>
                      {selectedPhase.sections.length === 0 && <div className="text-center py-16 bg-leemin-teal/[0.02] border border-leemin-teal/10"><p className="text-leemin-teal/30">이 차수에는 기록이 없습니다.</p></div>}
                    </>
                  )}
                </div>
              )}
            </>
          )
        ) : (
          trpgSessions.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-leemin-teal/15"><p className="text-leemin-teal/40">아직 TRPG 기록이 없습니다.</p><p className="text-leemin-teal/25 text-sm mt-2">어드민에서 Roll20 로그를 업로드해주세요.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trpgSessions.map(s => <TRPGSessionCard key={s.id} session={s} onClick={() => setSelectedTRPGSession(s)} />)}
            </div>
          )
        )}
      </div>

      {selectedSection && <SectionModal section={selectedSection} onClose={() => setSelectedSection(null)} onImageClick={(li, ii) => collectImages(selectedSection.lines, li, ii)} />}
      {selectedTRPGSession && <TRPGSessionModal session={selectedTRPGSession} onClose={() => setSelectedTRPGSession(null)} onImageClick={(li, ii) => collectImages(selectedTRPGSession.lines, li, ii)} />}
      {showGallery && galleryImages.length > 0 && <ImageGalleryModal images={galleryImages} initialIndex={galleryIndex} onClose={() => setShowGallery(false)} />}

      <footer className="py-12 text-center border-t border-leemin-teal/5 mt-12"><span className="text-sm text-leemin-teal/40 tracking-[0.3em]">∞ LEEMIN ARCHIVE</span></footer>
    </div>
  )
}
