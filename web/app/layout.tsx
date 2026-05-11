import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RFPOps',
  description: 'Federal RFP evaluation and proposal support',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0A0A] text-neutral-200">
        <nav className="border-b border-[#222222] px-6 py-3 flex items-center gap-8">
          <span className="mono text-[#FCD34D] font-medium tracking-tight">RFPOps</span>
          <a href="/" className="text-neutral-400 hover:text-neutral-200 text-sm transition-colors">RFPs</a>
          <a href="/profile" className="text-neutral-400 hover:text-neutral-200 text-sm transition-colors">Profile</a>
        </nav>
        <main className="px-6 py-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
