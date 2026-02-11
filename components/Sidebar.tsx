'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/intro', label: 'INTRO', number: '01' },
  { href: '/char', label: 'CHAR', number: '02' },
  { href: '/record', label: 'RECORD', number: '03' },
  { href: '/time', label: 'TIME', number: '04' },
]

export default function Sidebar() {
  const pathname = usePathname()
  if (pathname === '/admin' || pathname === '/') return null

  const isCharPage = pathname === '/char'

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 w-[240px] h-screen bg-black border-r border-leemin-teal/10 flex-col py-10 px-6 z-50 select-none">
        <Link href="/" className="flex items-center gap-2 mb-14">
          <svg width="28" height="14" viewBox="0 0 220 110" className="opacity-60">
            <path d="M110,55 C110,25 60,25 60,55 C60,85 110,85 110,55 C110,85 160,85 160,55 C160,25 110,25 110,55 Z" fill="none" stroke="#007B80" strokeWidth="8" strokeDasharray="4 8" strokeLinecap="round" />
          </svg>
          <span className="text-leemin-teal text-xl tracking-[0.3em] font-dot">
            LEEMIN
          </span>
        </Link>

        <ul className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 py-2.5 px-3 relative transition-all text-lg tracking-[0.15em] ${
                    isActive
                      ? 'text-leemin-teal bg-leemin-teal/10 border border-leemin-teal/30'
                      : 'text-leemin-teal/40 hover:text-leemin-teal/80 hover:bg-leemin-teal/5 border border-transparent'
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-leemin-teal" />}
                  <span className={`text-xs ${isActive ? 'text-leemin-teal/80' : 'text-leemin-teal/20'}`}>
                    {item.number}
                  </span>
                  <span>[{item.label}]</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Subject indicators */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00bfd6' }} />
            <span className="text-xs tracking-wider" style={{ color: '#00bfd640' }}>이 선</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9a9a9a' }} />
            <span className="text-xs tracking-wider" style={{ color: '#9a9a9a40' }}>김민재</span>
          </div>
        </div>

        <div className="pt-4 border-t border-leemin-teal/10">
          <p className="text-xs text-leemin-teal/25 leading-relaxed">
            SYS_STATUS: ONLINE<br />
            <span className="animate-blink">_</span>
          </p>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-black/95 backdrop-blur-lg border-t border-leemin-teal/15 flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs tracking-[0.1em] ${
                isActive ? 'text-leemin-teal' : 'text-leemin-teal/35'
              }`}
            >
              <span>[{item.label}]</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
