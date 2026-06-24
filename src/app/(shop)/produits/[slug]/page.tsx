import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function formatFCFA(montant: number) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

export default async function ProduitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: produit } = await supabase.from('produits').select('*').eq('slug', slug).single()

  if (!produit) return notFound()

  const enPromo = produit.prix_promo != null && produit.prix_promo < produit.prix

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
        {produit.images?.[0] ? (
          <Image src={produit.images[0]} alt={produit.nom} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">Pas d&apos;image</div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold">{produit.nom}</h1>
        <div className="mt-2">
          {enPromo ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-orange-600">{formatFCFA(produit.prix_promo)}</span>
              <span className="text-sm text-neutral-400 line-through">{formatFCFA(produit.prix)}</span>
            </div>
          ) : (
            <span className="text-xl font-bold">{formatFCFA(produit.prix)}</span>
          )}
        </div>
        <p className="mt-4 text-sm text-neutral-600">{produit.description}</p>
        <p className="mt-2 text-xs text-neutral-400">
          {produit.stock > 0 ? `${produit.stock} en stock` : 'Rupture de stock'}
        </p>
      </div>
    </div>
  )
}
