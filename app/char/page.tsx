'use client'

import { useState, useEffect } from 'react'

const seon = {
  nameKr: '이 선',
  nameEn: 'LEE SUN',
  quote: '" 머리 시키신 분? "',
  age: '36',
  gender: '데미젠더 남성',
  height: '181cm',
  weight: '79kg',
  service: '9년 / 前 베타 기지',
  dept: '기동체계부',
  tags: ['속물', '둔감', '인간 불신'],
  color: '#00bfd6',
  motto: '지금 내가 서 있는 위치와 하는 행동이 내가 누군지를 결정한다.',
  desc: '그을린 피부에 푸른색 머리를 짧게 깎은 아시아계 남성. 무의식중에 왼쪽 다리를 저는 독특한 걸음걸이가 특징. 항상 손에 자기 나침반과 등반용 피켈, 밧줄 따위가 들려 있다. 임무가 끝날 무렵엔 잘라낸 파트너의 머리를 들기도 했다.',
  lines: [
    '팀원들이 복제 인간이라서 좋은 점은 죽어도 죽지 않는다는 거죠.',
    '월급이랑 퇴사 생각하면서 버티죠. 다들 그렇지 않습니까?',
    '리미넌트가 왜 2인조로 일한다고 생각하세요?',
    '어차피 마지막까지 살아있는 건 저겠죠.',
  ],
  origin: '알파 구역 출신. 전직 군인, 연합 정부 감사원으로 파견.',
  specialty: '생존 기술, 의료 처치, 지도 제작, 암호 해독',
  likes: '돈. 단 음식, 낮잠.',
  dislikes: '미시감(Jamais vu). 불침번 서기.',
}

const minjae = {
  nameKr: '김민재',
  nameEn: 'KIM MIN JAE',
  quote: '" 비켜요, 앞 막지 말고. "',
  age: '28',
  gender: '논바이너리 / 메일 바디',
  height: '175cm',
  weight: '60kg',
  service: '4년',
  dept: '기동체계부',
  tags: ['방황자', '퉁명스러운', '자부심'],
  color: '#9a9a9a',
  motto: '',
  desc: '곱슬 흑발에 높은 콧대, 화려한 인상. 다양한 인종의 리미넌트들 사이에서 유독 눈에 띄는 외모를 지녔다. 적어도 미드가르드에 뿌리는 잡지에서 가장 매력적이라는 미인들의 이목구비만 하나씩 모았다고 봐도 된다.',
  lines: [
    '죄송한데 비난부터 하고 들어도 괜찮겠습니까?',
    '소중한 건 양심과 배려, 인간성입니다. 두려운 건 코 부러지는 거고요.',
    '누군가에게는 위로가 될 수 있는 인생이라고 믿습니다.',
    '말하지 않으면 난 모릅니다.',
  ],
  origin: '델타 구역의 아시안 집단 거주지 출신. 우주 심리학 전공.',
  specialty: '우주 심리학, 인터뷰, 기사 작성, 상담',
  likes: '독서, 매듭 묶기, 뜨개질.',
  dislikes: '계급 사회. 규정당하는 것.',
}

type CharKey = 'seon' | 'minjae'

function GlitchText({ text, color }: { text: string; color: string }) {
  const [glitch, setGlitch] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 150)
    }, 4000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="relative inline-block">
      <span style={{ color }}>{text}</span>
      {glitch && (
        <>
          <span className="absolute top-0 left-[2px] opacity-70" style={{ color, clipPath: 'inset(20% 0 60% 0)' }}>{text}</span>
          <span className="absolute top-0 left-[-2px] opacity-70" style={{ color, clipPath: 'inset(60% 0 10% 0)' }}>{text}</span>
        </>
      )}
    </span>
  )
}

export default function CharacterPage() {
  const [active, setActive] = useState<CharKey>('seon')
  const [mounted, setMounted] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)

  const char = active === 'seon' ? seon : minjae
  const accent = char.color
  const isSeon = active === 'seon'

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setLineIdx(0) }, [active])
  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => (i + 1) % char.lines.length), 5000)
    return () => clearInterval(t)
  }, [active, char.lines.length])

  if (!mounted) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      {/* Header with character switch */}
      <header className="border-b border-leemin-teal/10 relative overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs tracking-wider block mb-2" style={{ color: `${accent}55` }}>02</span>
              <h1 className="text-3xl md:text-4xl tracking-[0.3em]" style={{ color: `${accent}cc` }}>CHARACTER</h1>
              <p className="mt-1 text-sm" style={{ color: `${accent}55` }}>프로필</p>
            </div>

            {/* Character Toggle */}
            <div className="flex gap-0">
              <button
                onClick={() => setActive('seon')}
                className="px-4 md:px-6 py-2 text-sm tracking-[0.15em] border transition-all duration-300"
                style={{
                  borderColor: isSeon ? '#00bfd6' : 'rgba(0,191,214,0.15)',
                  background: isSeon ? 'rgba(0,191,214,0.12)' : 'transparent',
                  color: isSeon ? '#00bfd6' : 'rgba(0,191,214,0.3)',
                }}
              >
                이 선
              </button>
              <button
                onClick={() => setActive('minjae')}
                className="px-4 md:px-6 py-2 text-sm tracking-[0.15em] border transition-all duration-300"
                style={{
                  borderColor: !isSeon ? '#9a9a9a' : 'rgba(154,154,154,0.15)',
                  background: !isSeon ? 'rgba(154,154,154,0.1)' : 'transparent',
                  color: !isSeon ? '#9a9a9a' : 'rgba(154,154,154,0.3)',
                }}
              >
                김민재
              </button>
            </div>
          </div>
        </div>
        {/* Accent line */}
        <div className="h-px w-full transition-colors duration-700" style={{ background: `linear-gradient(to right, transparent, ${accent}40, transparent)` }} />
      </header>

      {/* Main content */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10 md:py-14" key={active}>

        {/* Top: Name + Quote */}
        <div className="mb-10 md:mb-14 animate-fade-in" style={{ animationDelay: '0.05s', opacity: 0 }}>
          <div className="flex items-baseline gap-4 mb-3">
            <GlitchText text={char.nameKr} color={accent} />
            <span className="text-xs tracking-[0.2em]" style={{ color: `${accent}40` }}>{char.nameEn}</span>
          </div>
          <p className="text-lg md:text-xl font-serif-kr font-light tracking-wide" style={{ color: `${accent}88` }}>
            {char.quote}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14">

          {/* Left: Visual + Basic Info */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0 }}>
            {/* Character Visual Placeholder */}
            <div
              className="relative aspect-[3/4] border overflow-hidden"
              style={{ borderColor: `${accent}18`, background: `linear-gradient(170deg, ${accent}08, black 60%)` }}
            >
              {/* Large symbol */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[12rem] md:text-[14rem] select-none" style={{ color: `${accent}06` }}>
                  {isSeon ? '⬡' : '◈'}
                </span>
              </div>
              {/* Scan line */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-px animate-scan" style={{ background: `${accent}15` }} />
              </div>
              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: `linear-gradient(transparent, ${accent}08)` }}>
                <p className="text-xs leading-relaxed font-serif-kr font-light" style={{ color: `${accent}60` }}>
                  {char.desc}
                </p>
              </div>
              {/* Corner marks */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={{ borderColor: `${accent}25` }} />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={{ borderColor: `${accent}25` }} />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" style={{ borderColor: `${accent}25` }} />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" style={{ borderColor: `${accent}25` }} />
            </div>

            {/* Basic Stats */}
            <div className="grid grid-cols-2 gap-px" style={{ background: `${accent}10` }}>
              {[
                { label: 'AGE', value: `${char.age}세` },
                { label: 'GENDER', value: char.gender },
                { label: 'HEIGHT', value: char.height },
                { label: 'WEIGHT', value: char.weight },
                { label: 'SERVICE', value: char.service },
                { label: 'DEPT', value: char.dept },
              ].map(item => (
                <div key={item.label} className="bg-black p-3">
                  <div className="text-[0.6rem] tracking-[0.15em] mb-1" style={{ color: `${accent}35` }}>{item.label}</div>
                  <div className="text-sm" style={{ color: `${accent}90` }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.25s', opacity: 0 }}>
            {/* Tags */}
            <div>
              <div className="text-[0.6rem] tracking-[0.2em] mb-3" style={{ color: `${accent}30` }}>PERSONALITY</div>
              <div className="flex gap-2 flex-wrap">
                {char.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 text-sm border" style={{ borderColor: `${accent}25`, color: `${accent}80`, background: `${accent}08` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Rotating Lines */}
            <div className="relative min-h-[60px] border-l-2 pl-4" style={{ borderColor: `${accent}30` }}>
              <div className="text-[0.6rem] tracking-[0.2em] mb-2" style={{ color: `${accent}25` }}>VOICE</div>
              <p
                key={lineIdx}
                className="text-base font-serif-kr font-light leading-relaxed animate-fade-in"
                style={{ color: `${accent}70` }}
              >
                &ldquo;{char.lines[lineIdx]}&rdquo;
              </p>
              <div className="flex gap-1 mt-3">
                {char.lines.map((_, i) => (
                  <div
                    key={i}
                    className="h-px transition-all duration-500"
                    style={{
                      width: i === lineIdx ? '24px' : '8px',
                      background: i === lineIdx ? accent : `${accent}25`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Origin */}
            <div className="py-5 border-t" style={{ borderColor: `${accent}10` }}>
              <div className="text-[0.6rem] tracking-[0.2em] mb-2" style={{ color: `${accent}30` }}>ORIGIN</div>
              <p className="text-sm leading-relaxed" style={{ color: `${accent}60` }}>{char.origin}</p>
            </div>

            {/* Specialty */}
            <div className="py-5 border-t" style={{ borderColor: `${accent}10` }}>
              <div className="text-[0.6rem] tracking-[0.2em] mb-2" style={{ color: `${accent}30` }}>SPECIALTY</div>
              <p className="text-sm leading-relaxed" style={{ color: `${accent}60` }}>{char.specialty}</p>
            </div>

            {/* Likes / Dislikes */}
            <div className="grid grid-cols-2 gap-6 py-5 border-t" style={{ borderColor: `${accent}10` }}>
              <div>
                <div className="text-[0.6rem] tracking-[0.2em] mb-2" style={{ color: `${accent}30` }}>LIKES</div>
                <p className="text-sm" style={{ color: `${accent}55` }}>{char.likes}</p>
              </div>
              <div>
                <div className="text-[0.6rem] tracking-[0.2em] mb-2" style={{ color: `${accent}30` }}>DISLIKES</div>
                <p className="text-sm" style={{ color: `${accent}55` }}>{char.dislikes}</p>
              </div>
            </div>

            {/* Motto */}
            {char.motto && (
              <div className="p-5 border" style={{ borderColor: `${accent}15`, background: `${accent}05` }}>
                <div className="text-[0.6rem] tracking-[0.2em] mb-2" style={{ color: `${accent}30` }}>MOTTO</div>
                <p className="text-sm font-serif-kr font-light italic leading-relaxed" style={{ color: `${accent}70` }}>
                  {char.motto}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 text-center border-t" style={{ borderColor: `${accent}08` }}>
        <span className="text-xs tracking-[0.3em]" style={{ color: `${accent}25` }}>∞ LEEMIN ARCHIVE</span>
      </footer>
    </div>
  )
}
