import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/context/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import '@/index.css'

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Whoosh MD - Find Healthcare Providers Near You',
  description: 'Quickly find healthcare providers near you with Whoosh MD. Search by name, specialty, location and more using NPI Registry data.',
  keywords: 'healthcare providers, doctors, medical professionals, NPI registry, voice agent, appointments',
  authors: [{ name: 'Whoosh MD Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Whoosh MD - Find Healthcare Providers Near You',
    description: 'Quickly find healthcare providers near you with Whoosh MD. Search by name, specialty, location and more using NPI Registry data.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <AppProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}