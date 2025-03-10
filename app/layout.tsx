import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import Chat from './components/Chat'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Akbar Afriansyah | Developer & Tech Enthusiast',
    template: '%s | Akbar Afriansyah',
  },
  description: 'Portofolio resmi Akbar Afriansyah, seorang Full-Stack Developer yang fokus pada solusi berbasis teknologi AI, data, dan cloud.',
  openGraph: {
    title: 'Akbar Afriansyah | Developer & Tech Enthusiast',
    description: 'Jelajahi proyek dan pengalaman Akbar Afriansyah dalam pengembangan perangkat lunak, data engineering, dan teknologi berbasis cloud.',
    url: baseUrl,
    siteName: 'Akbar Afriansyah | Portfolio',
    locale: 'id_ID',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white dark:text-white dark:bg-black',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
          <Footer />
          <Chat />
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  )
}
