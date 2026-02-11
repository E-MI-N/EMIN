'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const systemLogs = [
  "Fickcurtte fourteen bg Font [0D7D1N180],",
  "Fionesleed 102.16.10.01.100], 908(00:105[880].mem.011:6:5:[15]]",
  "[Sewe i0gth 25. 30.3p 100]",
  "Fickcurtte fourteen bo DMD_EFETT: YN. TILT COG/inIR: T007INIENT,",
  "[over nuiget niite menns, apsireerriinu tramfcol romns: { }]"
]

export default function Home() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "leemin1234") {
      if (typeof window !== 'undefined') localStorage.setItem('leemin_admin_login', 'true')
      router.push('/admin')
    } else {
      alert('ACCESS DENIED: INVALID_PASSKEY')
    }
  }

  return (
    <div className="min-h-screen bg-black text-leemin-teal relative overflow-hidden flex flex-col items-center justify-between py-10 select-none">
      <div className="w-full max-w-4xl px-8 text-[10px] opacity-40 leading-tight">
        {systemLogs.map((log, i) => <p key={i}>{log}</p>)}
      </div>

      <div className="flex flex-col items-center justify-center flex-1 z-10">
        <div className="mb-12">
          <svg width="220" height="110" viewBox="0 0 220 110">
            <path d="M110,55 C110,25 60,25 60,55 C60,85 110,85 110,55 C110,85 160,85 160,55 C160,25 110,25 110,55 Z" fill="none" stroke="#007B80" strokeWidth="6" strokeDasharray="4 8" strokeLinecap="round" className="opacity-20" />
            <path d="M110,55 C110,25 60,25 60,55 C60,85 110,85 110,55 C110,85 160,85 160,55 C160,25 110,25 110,55 Z" fill="none" stroke="#007B80" strokeWidth="6" strokeDasharray="4 8" strokeLinecap="round" className="animate-glitch-static" />
          </svg>
        </div>

        <div className="w-full max-w-sm text-2xl tracking-[0.2em] space-y-2">
          {loadingStep >= 0 && <p>INITIALIZING SYSTEM.. <span className="animate-pulse">X</span></p>}
          {loadingStep >= 1 && <p>CONNECTING TO DATABASE.. <span className="animate-pulse">X</span></p>}
          {loadingStep >= 2 && <p>LOADING ARCHIVE: LEEMIN..]</p>}
          {loadingStep >= 3 && <p className="text-white bg-leemin-teal/30 px-2 mt-4 inline-block">ACCESS GRANTED.</p>}
        </div>
      </div>

      <footer className="w-full max-w-4xl px-8 flex flex-col md:flex-row items-center justify-between text-lg z-10">
        <nav className="flex gap-8 tracking-widest opacity-60">
          {['intro', 'char', 'record', 'time'].map((item) => (
            <Link key={item} href={`/${item}`} className="hover:text-white hover:opacity-100 transition-all">[{item.toUpperCase()}]</Link>
          ))}
        </nav>
        <button onClick={() => setShowLogin(true)} className="mt-6 md:mt-0 text-xs opacity-30 hover:opacity-100 transition-all tracking-[0.3em]">[ SYS_ADMIN_LOGIN ]</button>
      </footer>

      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={() => setShowLogin(false)}>
          <div className="bg-black border-2 border-leemin-teal p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <p className="opacity-70 mb-6 text-sm">&apos;clent&apos; AUTHENTICATION REQUIRED</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs opacity-50">if tystfor = &apos;unttiainimed)</p>
                <label className="block mb-2 text-xl">ENTER_PASS</label>
                <div className="flex items-center gap-3">
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-leemin-teal/10 border border-leemin-teal w-full py-2 px-3 text-leemin-teal focus:outline-none" autoFocus />
                  <span className="opacity-50">&apos;true</span>
                </div>
              </div>
              <button className="w-full border border-leemin-teal py-2 hover:bg-leemin-teal hover:text-black transition-all uppercase tracking-widest text-sm">Run_Sequence</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
