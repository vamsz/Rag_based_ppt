import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Universal RAG-to-PPT',
  description: 'Generate presentations from any document using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

