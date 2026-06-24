'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import type { Produit } from '@/types'
import { usePanier } from '@/lib/store/panier'

function formatFCFA(montant: number) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

export default function ProduitCard({ produit }: { produit: Produit }) {
  const ajouter = usePanier((s) => s.ajouter)
  const enPromo = produit.prix_promo != null && produit.prix_promo < produit.prix

  return (
    <div className="group relative rounded-xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:shadow-md">
      <button
        className="absolute right-4 top-4 z-10 rounded-full bg-white p-1.5 shadow hover:text-red-500"
        aria-label="Ajouter aux favoris"
      >
        <Heart className="h-4 w-4" />
      </button>

      <Link href={`/produits/${produit.slug}`}>
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
          {produit.images?.[0] ? (
            <Image
              src={produit.images[0]}
              alt={produit.nom}
              fill
              className="object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
              Pas d&apos;image
            </div>
          )}
          {enPromo && (
            <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-0.5 text-xs font-semibold text-white">
              Promo
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-800">{produit.nom}</h3>
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <div>
          {enPromo ? (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-orange-600">
                {formatFCFA(produit.prix_promo!)}
              </span>
              <span className="text-xs text-neutral-300 line-through">
                {formatFCFA(produit.prix)}
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-neutral-900">{formatFCFA(produit.prix)}</span>
          )}
        </div>
        <button
          onClick={() => ajouter(produit)}
          className="rounded-full bg-orange-600 p-2 text-white transition hover:bg-orange-700"
          aria-label="Ajouter au panier"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
