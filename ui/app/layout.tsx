// ============================================================
// app/layout.tsx
// ============================================================
// The root layout wraps every page in the app.
// In Next.js App Router, layout.tsx persists across navigations —
// it is NOT re-mounted when you move between pages, making it
// the right place for things like fonts, meta tags, and global CSS.
// ============================================================

import type { Metadata } from 'next'
import './globals.css'

// Metadata is a Next.js convention that sets <title> and <meta> tags.
export const metadata: Metadata = {
  title: 'LLM On-Prem',
  description: 'Private AI assistant — runs entirely on your own hardware.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/*
        body gets the full viewport height so the sidebar and chat area
        can fill the screen without overflow.
      */}
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  )
}
