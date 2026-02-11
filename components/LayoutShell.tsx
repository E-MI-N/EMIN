'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const noSidebar = pathname === '/' || pathname === '/admin'

  return (
    <>
      <Sidebar />
      <main className={`min-h-screen ${noSidebar ? '' : 'ml-0 md:ml-[240px]'}`}>
        {children}
      </main>
    </>
  )
}
