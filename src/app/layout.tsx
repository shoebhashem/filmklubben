import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Filmklubben',
  description: 'Vi tittar. Vi diskuterar. Vi betygsätter.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950">{children}</body>
    </html>
  )
}
