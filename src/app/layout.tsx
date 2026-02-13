import type { Metadata, Viewport } from "next"
import { Geist_Mono, Sora } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { PwaInstall } from "@/components/pwa-install"
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Impostor",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const themeScript = `
    (function(){
      var t = localStorage.getItem('theme');
      if (t === 'dark') document.documentElement.classList.add('dark');
      else if (t === 'light') document.documentElement.classList.remove('dark');
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    })();
  `

  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${geistMono.variable} font-sans antialiased h-full`}
      >
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <div className="relative min-h-full flex flex-col safe-area-padding">
          <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-3 pt-4 sm:px-4 sm:pt-6 min-h-0">
            {children}
          </main>
        </div>

        <PwaInstall />
        <Toaster />
      </body>
    </html>
  )
}
