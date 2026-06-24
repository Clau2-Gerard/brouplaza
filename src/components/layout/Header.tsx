'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, User, Search, Menu } from 'lucide-react'
import { usePanier } from '@/lib/store/panier'
import CategorySidebar from './CategorySidebar'
import QuickLinksBar from './QuickLinksBar'

export default function Header() {
  const items = usePanier((s) => s.items)
  const totalArticles = items.reduce((acc, i) => acc + i.quantite, 0)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const drapeauCm = "\u{1F1E8}\u{1F1F2}"; // C + M
  const drapeauCh = "\u{1F1E8}\u{1F1F3}"; // C + H

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      {/* Ligne 1 : burger, logo, recherche (desktop), icônes */}
      <div className="mx-auto flex items-center w-full gap-4 px-4 py-3">
        <button
          onClick={() => setMenuOuvert(true)}
          aria-label="Ouvrir le menu des catégories"
          className="text-neutral-700 hover:text-orange-600"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="text-xl font-bold tracking-tight text-orange-600">
          ChinaPlaza {drapeauCh}{drapeauCm}
        </Link>

        {/* Recherche : visible uniquement sur tablette/desktop (2ème étage masqué) */}
        <div className="relative ml-4 hidden flex-1 max-auto sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="search"
            placeholder="Rechercher un article..."
            className="w-full rounded-full border border-neutral-200 bg-neutral-700 py-2 pl-9 pr-4 text-sm outline-none focus:border-orange-400"
          />
        </div>

        <nav className="ml-auto flex items-center gap-4">
          <Link href="/wishlist" className="relative text-neutral-700 hover:text-orange-600">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/panier" className="relative text-neutral-700 hover:text-orange-600">
            <ShoppingCart className="h-5 w-5" />
            {totalArticles > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                {totalArticles}
              </span>
            )}
          </Link>
          <Link href="/compte/profil" className="text-neutral-700 hover:text-orange-600">
            <User className="h-5 w-5" />
          </Link>
        </nav>
      </div>

      {/* Ligne 2 (mobile uniquement) : barre de recherche */}
      <div className="px-4 pb-3 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white" />
          <input
            type="search"
            placeholder="Rechercher un article..."
            className="w-full rounded-full border border-neutral-200 bg-neutral-700 py-2 pl-9 pr-4 text-sm outline-none focus:border-orange-400"
          />
        </div>
      </div>

      {/* Ligne 3 (mobile) / Ligne 2 (desktop) : liens rapides défilants */}
      <QuickLinksBar />

      <CategorySidebar open={menuOuvert} onClose={() => setMenuOuvert(false)} />
    </header>
  )
}
