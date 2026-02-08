import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Impostor",
  description: "Juego de deducción social",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#0b1220_40%,_#050a14)]">
          <main className="max-w-md mx-auto px-4 pt-6 pb-24 min-h-screen">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
