'use client'

import { useState } from 'react'

interface TimeEvent {
  era: string
  title: string
  subtitle?: string
  desc: string
  speakers?: ('seon' | 'mj')[]
  quote?: string
  future?: boolean
}

const events: TimeEvent[] = [
  {
    era: '입사 전',
    title: '각자의 과거',
    subtitle: '알파 — 델타',
    desc: '이 선은 연합 정부 특수부대에서 첩보병으로 복무했다. 팀원 전원이 순직한 뒤, 반사회적 기질 진단을 받고 감사원으로 파견된다. 김민재는 델타의 아시안 공동체에서 성장했으나 끝내 동화되지 못한 채 은사를 따라 우주 심리학을 전공했다.',
    speakers: ['seon', 'mj'],
  },
  {
    era: '베타 기지',
    title: '50달러만 주면 죽여주는 놈',
    subtitle: '이 선 — 근속 9년',
    desc: '업무 중 존엄사를 요청하는 동료의 부탁을 들어주며 소문이 퍼졌다. 감사원이라는 본래의 직무를 숨긴 채, 리미넌트를 철저히 타자화하며 9년을 버텼다.',
    speakers: ['seon'],
    quote: '얼마까지 알아보고 오셨어요?',
  },
  {
    era: '제타 프로젝트',
    title: '첫 만남',
    subtitle: '매력 어필',
    desc: '교류 미션에서 처음 마주한 둘. 이 선은 이해타산에 빠삭한 점을 매력으로 내세우고, 김민재는 한치의 거짓말 없이 얼굴이라 답했다.',
    speakers: ['seon', 'mj'],
    quote: '이런 뿌리에 그런 외형인 건 이상하죠.',
  },
  {
    era: '제타 기지',
    title: '고향의 부재',
    subtitle: '담배 한 개비',
    desc: '각자의 고향과 방황에 대해 처음으로 깊이 대화했다. 선은 향담배를 권하고, 민재는 은사의 죽음을 이야기했다. 나의 고향은 사라졌습니다. 사람을 고향으로 삼아서요.',
    speakers: ['seon', 'mj'],
    quote: '보통 사람은 환경에 적응하는데, 당신은 왜 그러지 못합니까?',
  },
  {
    era: '제타 기지',
    title: '인간성의 검증',
    subtitle: '곱슬머리',
    desc: '선은 민재의 머리를 헝클고, 민재는 선의 다리를 물었다. 양심과 배려, 인간성이 소중하다 말하면서도 서로의 날카로움에 상처를 주고받았다.',
    speakers: ['seon', 'mj'],
    quote: '거부감이 증거라면 여긴 이미 인간성을 잃은 사람투성이겠네요.',
  },
  {
    era: 'REA',
    title: '귀',
    subtitle: '설원에서',
    desc: '선은 민재의 귀를 잘랐다. 포식과 이해, 효율과 흥미 사이에서. 민재는 죽어가면서도 당신이 깨어날 때까지 전전긍긍 고민이나 처하세요, 라고 말했다.',
    speakers: ['seon', 'mj'],
    quote: '저도 민재 씨가 소중해요.',
  },
  {
    era: 'REA',
    title: '동행의 약속',
    subtitle: '칵테일과 재회',
    desc: '선은 감사원이었다는 비밀을 밝히고 뫼비우스 고발을 제안한다. 민재는 동행하자고 당당하게 얘기하세요, 라고 응수했다.',
    speakers: ['seon', 'mj'],
    quote: '같이 있을 때 기쁩니다.',
  },
  {
    era: 'REA',
    title: '델타의 바다',
    subtitle: '다섯 달 뒤',
    desc: '민재는 자신이 정한 생일에 둘이서 델타의 바다에 가고 싶다고 말했다. 선은 Okay, let\'s rock a boat. 라고 답했다.',
    speakers: ['seon', 'mj'],
    quote: '좀 더 친해지고, 가까워지고 싶다는 의미의 친밀함이에요.',
  },
  {
    era: 'REA',
    title: '간이 샤워장',
    subtitle: '멘타핀',
    desc: '약물과 메스, 타일 위의 피. 의사 놀이는 고백이 되고, 고백은 상처가 되고, 상처는 유대가 된다. 두 사람의 관계가 돌이킬 수 없는 곳으로 향했다.',
    speakers: ['seon', 'mj'],
  },
  {
    era: '???',
    title: '이후',
    desc: '동행이 끝나도 보러 가도 돼요? 저는 외로울 것 같습니다.',
    speakers: ['mj'],
    future: true,
    quote: '제가 살면서 지루할 일 없게 해 드릴게요.',
  },
]

export default function TimelinePage() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <header className="border-b border-leemin-teal/10 p-10 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-leemin-teal/5 to-transparent" />
        <div className="relative z-10">
          <span className="text-xs text-leemin-teal/40 tracking-wider">04</span>
          <h1 className="text-4xl md:text-5xl tracking-[0.3em] mt-2">TIMELINE</h1>
          <p className="text-leemin-teal/45 mt-2">연대기</p>
        </div>
      </header>

      <div className="max-w-[750px] mx-auto px-6 py-14 pl-10 md:pl-6 relative">
        {/* Vertical line */}
        <div className="absolute left-[22px] md:left-[calc(50%-375px+22px)] top-0 bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, rgba(0,123,128,0.5), rgba(0,123,128,0.15), rgba(0,123,128,0.05))' }}
        />

        <div className="space-y-6">
          {events.map((event, index) => {
            const isHovered = hoveredIdx === index
            return (
              <div
                key={index}
                className="relative pl-12"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Marker */}
                <div className="absolute left-0 top-2 flex items-center gap-0">
                  {/* Dot */}
                  <div
                    className="w-[9px] h-[9px] border-2 border-black transition-colors"
                    style={{
                      background: event.future ? 'transparent' :
                        event.speakers?.includes('seon') && event.speakers?.includes('mj')
                          ? '#007B80'
                          : event.speakers?.includes('seon') ? '#00bfd6' : '#9a9a9a',
                      borderColor: event.future ? 'rgba(0,123,128,0.25)' : 'black',
                    }}
                  />
                  {/* Connector line */}
                  <div className="w-6 h-px" style={{ background: 'rgba(0,123,128,0.15)' }} />
                </div>

                {/* Content card */}
                <div
                  className={`p-5 border transition-all duration-300 ${
                    event.future ? 'border-dashed' : ''
                  }`}
                  style={{
                    borderColor: isHovered ? 'rgba(0,123,128,0.35)' : event.future ? 'rgba(0,123,128,0.1)' : 'rgba(0,123,128,0.12)',
                    background: isHovered ? 'rgba(0,123,128,0.04)' : 'rgba(0,123,128,0.01)',
                  }}
                >
                  {/* Era + Speaker indicators */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[0.65rem] text-leemin-teal/50 tracking-[0.1em]">{event.era}</span>
                    {event.speakers && (
                      <div className="flex gap-1 ml-auto">
                        {event.speakers.includes('seon') && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00bfd6' }} />}
                        {event.speakers.includes('mj') && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9a9a9a' }} />}
                      </div>
                    )}
                  </div>

                  <h3 className={`text-lg text-leemin-teal mb-0.5 ${event.future ? 'italic text-leemin-teal/45' : ''}`}>
                    {event.title}
                  </h3>
                  {event.subtitle && (
                    <p className="text-xs text-leemin-teal/30 mb-2">{event.subtitle}</p>
                  )}
                  <p className="text-sm text-leemin-teal/50 leading-relaxed font-serif-kr font-light">
                    {event.desc}
                  </p>

                  {event.quote && (
                    <div className="mt-3 pt-3 border-t border-leemin-teal/8">
                      <p className="text-sm text-leemin-teal/40 font-serif-kr font-light italic">
                        &ldquo;{event.quote}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <footer className="py-12 text-center border-t border-leemin-teal/5">
        <span className="text-sm text-leemin-teal/25 tracking-[0.3em]">∞ LEEMIN ARCHIVE</span>
      </footer>
    </div>
  )
}
