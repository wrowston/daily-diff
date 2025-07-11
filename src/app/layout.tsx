import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { NavigationMenu } from '@/components/NavigationMenu'
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
  title: 'Daily Diff - Structured Journaling for Busy Builders',
  description: 'Stay focused, reflect clearly, and track your dev journey—one daily prompt at a time.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Header */}
          <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-900 transition-colors">
                    Daily Diff
                  </Link>
                </div>
                
                {/* Navigation Links */}
                <NavigationMenu />

                {/* Auth Buttons */}
                <div className="flex items-center space-x-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                        Log In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Link
                        href="/journal"
                        className="bg-blue-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Get Started
                      </Link>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>

          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}