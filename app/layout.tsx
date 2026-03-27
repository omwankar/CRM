import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CRM Portal - Manage Your Business',
  description: 'Comprehensive CRM system for managing certifications, memberships, partnerships, insurance, vendors, buyers, and documents.',
  keywords: ['CRM', 'Business Management', 'Certifications', 'Insurance'],
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'CRM Portal - Manage Your Business',
    description: 'Comprehensive CRM system for managing certifications, memberships, partnerships, insurance, vendors, buyers, and documents.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}