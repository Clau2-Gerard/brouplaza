'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus } from 'lucide-react'
import { usePanier } from '@/lib/store/panier'

function formatFCFA(montant: number) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

export default function PanierPage() {
  const { items, retirer, modifierQuantite, total } = usePanier()

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500">Votre panier est vide.</p>
        <Link href="/" className="mt-4 inline-block rounded-full bg-orange-600 px-6 py-2 text-white">
          Continuer mes achats
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <h1 className="text-xl font-bold text-white">Mon panier</h1>
        {items.map(({ produit, quantite }) => {
          const prix = produit.prix_promo ?? produit.prix
          return (
            <div key={produit.id} className="flex items-center gap-4 rounded-xl border self-center bg-white p-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {produit.images?.[0] && (
                  <Image src={produit.images[0]} alt={produit.nom} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{produit.nom}</h3>
                <p className="text-sm font-bold text-orange-600">{formatFCFA(prix)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => modifierQuantite(produit.id, Math.max(1, quantite - 1))}
                  className="rounded-full border p-1"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm">{quantite}</span>
                <button
                  onClick={() => modifierQuantite(produit.id, quantite + 1)}
                  className="rounded-full border p-1"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <button onClick={() => retirer(produit.id)} className="text-neutral-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border bg-white p-4 h-fit self-center">
        <h2 className="mb-3 font-semibold">Résumé</h2>
        <div className="flex justify-between text-sm mb-2">
          <span>Sous-total</span>
          <span>{formatFCFA(total())}</span>
        </div>
        <p className="mb-4 text-xs text-neutral-500">
          Frais de livraison calculés à l&apos;étape suivante selon votre zone.
        </p>
        <Link
          href="/checkout"
          className="block rounded-full bg-orange-600 py-2 text-center font-semibold text-white hover:bg-orange-700"
        >
          Passer la commande
        </Link>
      </div>
    </div>
  )
}
