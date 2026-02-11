'use client'

import { useState, useEffect } from 'react'

const bootSequence = [
  '> LEEMIN ARCHIVE v2.7.1',
  '> Initializing system...',
  '> Loading personnel database...',
  '> 2 SUBJECTS FOUND',
  '> SEON, LEE — STATUS: ACTIVE',
  '> MINJAE, KIM — STATUS: ACTIVE',
  '> Decrypting memory logs...',
  '> ARCHIVE READY_',
]

export default function IntroPage() {
  const [bootIdx, setBootIdx] = useState(0)
  const [bootDone, setBootDone] = useState(false)

  useEffect(() => {
    if (bootIdx < bootSequence.length) {
      const delay = bootIdx === 0 ? 300 : 200 + Math.random() * 400
      const t = setTimeout(() => setBootIdx(i => i + 1), delay)
      return () => clearTimeout(t)
    } else {
      setTimeout(() => setBootDone(true), 600)
    }
  }, [bootIdx])

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      {/* Header */}
      <header className="border-b border-leemin-teal/10 p-10 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-leemin-teal/5 to-transparent" />
        <div className="relative z-10">
          <span className="text-xs text-leemin-teal/40 tracking-wider block mb-2">01</span>
          <h1 className="text-4xl md:text-5xl tracking-[0.3em] mt-2">INTRO</h1>
          <p className="text-leemin-teal/45 mt-2">아카이브 소개</p>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto px-8 py-12 md:py-16">

        {/* Boot Sequence */}
        <div className="mb-14 p-6 border border-leemin-teal/10 bg-leemin-teal/[0.02] min-h-[240px]">
          <div className="space-y-1">
            {bootSequence.slice(0, bootIdx).map((line, i) => (
              <div
                key={i}
                className="text-sm animate-fade-in"
                style={{
                  color: line.includes('ACTIVE') ? '#00bfd6' :
                         line.includes('READY') ? '#007B80' :
                         'rgba(0,123,128,0.5)',
                }}
              >
                {line}
              </div>
            ))}
            {!bootDone && bootIdx < bootSequence.length && (
              <span className="inline-block w-2 h-4 bg-leemin-teal/60 animate-blink" />
            )}
          </div>
        </div>

        {/* Main Content */}
        {bootDone && (
          <div className="space-y-16" style={{ animation: 'fade-up 0.8s ease-out forwards' }}>

            {/* About the Archive */}
            <section>
              <h2 className="text-2xl md:text-3xl tracking-[0.15em] text-leemin-teal/80 mb-6">
                About This Archive
              </h2>
              <div className="text-leemin-teal/50 text-base md:text-lg leading-[1.9] font-serif-kr font-light space-y-4">
                <p>
                  안녕하세요. <span className="text-leemin-teal/80">이민</span>입니다.
                </p>
                <p>
                  이 아카이브는 TRPG 프로젝트 <span className="text-leemin-teal/70">뫼비우스</span>에서
                  운용하는 두 명의 캐릭터 — <span style={{ color: '#00bfd6' }}>이 선</span>과
                  {' '}<span style={{ color: '#9a9a9a' }}>김민재</span>의 기록을 보관합니다.
                </p>
                <p>
                  복제 인간이 자원으로 소모되는 세계에서, 한 명은 평범한 사람으로 남기 위해 동화를 택했고,
                  다른 한 명은 방황 자체를 증명으로 삼았습니다.
                  둘은 서로의 거울이자 이방인입니다.
                </p>
              </div>
            </section>

            {/* Two Columns: Characters Preview */}
            <section>
              <h2 className="text-sm tracking-[0.2em] text-leemin-teal/30 mb-6">SUBJECTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-leemin-teal/10">

                {/* Seon */}
                <div className="bg-black p-6 md:p-8 group hover:bg-[#00bfd606] transition-colors">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl tracking-wider" style={{ color: '#00bfd6' }}>이 선</span>
                    <span className="text-xs tracking-[0.15em]" style={{ color: '#00bfd640' }}>LEE SUN</span>
                  </div>
                  <p className="text-sm font-serif-kr font-light leading-relaxed mb-4" style={{ color: '#00bfd660' }}>
                    36세. 前 군인, 연합 정부 감사원.<br />
                    50달러만 주면 죽여주는 놈이라 불렸다.<br />
                    어서 퇴사하고 튀자는 마음가짐으로 9년을 버텼다.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {['속물', '둔감', '인간 불신'].map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 border" style={{ borderColor: '#00bfd620', color: '#00bfd660' }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Minjae */}
                <div className="bg-black p-6 md:p-8 group hover:bg-[#9a9a9a06] transition-colors">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl tracking-wider" style={{ color: '#9a9a9a' }}>김민재</span>
                    <span className="text-xs tracking-[0.15em]" style={{ color: '#9a9a9a40' }}>KIM MIN JAE</span>
                  </div>
                  <p className="text-sm font-serif-kr font-light leading-relaxed mb-4" style={{ color: '#9a9a9a60' }}>
                    28세. 우주 심리학 전공, 기자 경력.<br />
                    동화되고 싶지 않아서 줄곧 방황했다.<br />
                    적어도 누군가에게 위로가 될 인생을 원했다.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {['방황자', '퉁명스러운', '자부심'].map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 border" style={{ borderColor: '#9a9a9a20', color: '#9a9a9a60' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Concept */}
            <section className="border-t border-leemin-teal/10 pt-10">
              <h2 className="text-sm tracking-[0.2em] text-leemin-teal/30 mb-6">CONCEPT NOTE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-serif-kr font-light leading-relaxed">
                <div className="border-l-2 pl-4" style={{ borderColor: '#00bfd630', color: '#00bfd655' }}>
                  뒷걸음질 상식인 포지션. 선천적인 기질 덕분에 디스토피아에서도 소시민·직장인적 사고로 살아가는 세미 사이코패스.
                  시리어스 분위기를 저해하지 않는 K-블랙코미디풍 캐어필을 지향합니다.
                </div>
                <div className="border-l-2 pl-4" style={{ borderColor: '#9a9a9a30', color: '#9a9a9a55' }}>
                  과거 교수의 인터뷰 과제를 회상하며, 죽음을 여러 번 맞이한 현재와 과거의 동일성에 대해 고민하는 인물.
                  델타에서 감마로 이주한 후, 같은 뿌리의 인물과 처음으로 마주한 기억을 안고 있습니다.
                </div>
              </div>
            </section>

            {/* Player Info */}
            <section className="border-t border-leemin-teal/10 pt-10">
              <h2 className="text-sm tracking-[0.2em] text-leemin-teal/30 mb-6">OPERATOR</h2>
              <div className="text-leemin-teal/50 text-sm font-serif-kr font-light leading-[1.9]">
                <p>
                  이 아카이브는 개인 창작 기록 보관을 위해 제작되었습니다.
                </p>
                <p className="mt-2 text-leemin-teal/30">
                  캐릭터의 붕괴에 민감하지 않습니다. 가오 떨어지는 이벤트나 분위기 환기용 이벤트가 있다면 편하게 써주세요.
                </p>
              </div>
            </section>

          </div>
        )}
      </div>

      <footer className="py-12 text-center border-t border-leemin-teal/5">
        <span className="text-sm text-leemin-teal/25 tracking-[0.3em]">∞ LEEMIN ARCHIVE</span>
      </footer>
    </div>
  )
}
