'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { categoriesNav } from '@/data/categories'

export default function CategorySidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [ouverte, setOuverte] = useState<string | null>(null)

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
     
    <aside
      className={`fixed left-0 top-0 z-[70] h-screen w-72 max-w-[85vw] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      role="dialog"
      aria-modal="true" // Ajout accessibilité
      aria-label="Catégories"
    >
      {/* En-tête de l'aside */}
      <div className="flex h-14 items-center justify-between border-b border-neutral-100 px-4">
        <h2 className="text-base font-bold text-neutral-900">Catégories</h2>
        <button 
          onClick={onClose} 
          aria-label="Fermer le menu"
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-56px)] overflow-y-auto py-2 custom-scrollbar">
        {categoriesNav.map((cat) => {
          const estOuverte = ouverte === cat.slug
          const aDesSousCategories = cat.sousCategories && cat.sousCategories.length > 0

          return (
            <div key={cat.slug} className="w-full">
              {/* Ligne Catégorie principale */}
              <div className="flex items-center justify-between px-4 py-1 hover:bg-neutral-50 transition-colors">
                {/* Le lien principal ferme l'aside et navigue */}
                <Link 
                  href={`/categories/${cat.slug}`} 
                  onClick={onClose} 
                  className="flex-1 py-2.5 text-sm font-semibold text-neutral-800 hover:text-orange-600 transition-colors"
                >
                  {cat.nom}
                </Link>
                
                {/* Le bouton chevron gère uniquement l'accordéon sans naviguer */}
                {aDesSousCategories && (
                  <button
                    onClick={() => setOuverte(estOuverte ? null : cat.slug)}
                    aria-expanded={estOuverte}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                  >
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        estOuverte ? 'rotate-180 text-orange-600' : ''
                      }`} 
                    />
                  </button>
                )}
              </div>

              {/* Sous-catégories avec animation d'ouverture */}
              {aDesSousCategories && (
                <div 
                  className={`grid transition-all duration-200 ease-in-out bg-neutral-50/60 ${
                    estOuverte ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-l-2 border-neutral-200 ml-6 my-1 pl-4 space-y-1">
                      {cat.sousCategories?.map((sous) => (
                        <Link
                          key={sous.slug}
                          href={`/categories/${cat.slug}/${sous.slug}`}
                          onClick={onClose}
                          className="block py-2 text-sm text-neutral-600 hover:text-orange-600 transition-colors"
                        >
                          {sous.nom}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
    </>
  )
}
