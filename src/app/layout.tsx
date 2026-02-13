import type { Metadata } from "next"
import { Geist_Mono, Sora } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const sora = Sora({
  variable: "--font-sora",
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
    <html lang="es" className="dark h-full">
      <body
        className={`${sora.variable} ${geistMono.variable} font-sans antialiased h-full`}
      >
        <div className="relative min-h-full flex flex-col">
          <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-3 pt-4 sm:px-4 sm:pt-6 min-h-0">
            {children}
          </main>
        </div>

        <Toaster />
      </body>
    </html>
  )
}
