import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'ChinaPlaza — E-commerce Douala',
  description: 'Achetez en ligne au marché China Plaza Ndokoti, livraison à Douala et expédition partout au Cameroun.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t bg-white py-8 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} ChinaPlaza — China Plaza Ndokoti, Douala
        </footer>
      </body>
    </html>
  )
}
