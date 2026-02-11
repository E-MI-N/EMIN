import './globals.css'
import type { Metadata } from 'next'
import LayoutShell from '@/components/LayoutShell'

export const metadata: Metadata = {
  title: 'LEEMIN ARCHIVE',
  description: '이민의 개인 아카이브',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-leemin-teal min-h-screen font-dot">
        <div className="crt-overlay"></div>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
