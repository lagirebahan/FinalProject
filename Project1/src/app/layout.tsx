import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Recycling Advisor - AI-Powered Recycling Guide',
  description: 'Get intelligent recycling advice using AI image recognition. Upload photos of items to learn the best recycling practices.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="id">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Navigation Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🌱</span>
                  <span className="text-xl font-bold text-green-800">Recycling Advisor</span>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-4">
                  <SignedOut>
                    <SignInButton>
                      <button className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors">
                        Masuk
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                        Daftar
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10"
                        }
                      }}
                    />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          {children}

          {/* Footer */}
          <footer className="bg-gray-800 text-white mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="text-2xl">🌱</span>
                  <span className="text-xl font-bold">Recycling Advisor</span>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Platform AI yang membantu Anda membuat keputusan daur ulang yang tepat.
                </p>
                <p className="text-gray-400 text-xs">
                  © 2024 Recycling Advisor. Dibuat dengan ❤️ untuk lingkungan yang lebih baik.
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}