import ProduitCard from '@/components/produit/ProduitCard'
import { createClient } from '@/lib/supabase/server'
import type { Produit } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: produits } = await supabase
    .from('produits')
    .select('*')
    .eq('actif', true)
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-400 px-6 py-10 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Les articles du China Plaza Ndokoti, livrés chez vous
        </h1>
        <p className="mt-2 max-w-xl text-orange-50">
          Livraison rapide à Douala et expédition vers les autres villes du Cameroun.
        </p>
      </section>

      <h2 className="mb-4 text-lg font-semibold">Nouveautés</h2>

      {!produits || produits.length === 0 ? (
        <p className="text-neutral-500">
          Aucun produit disponible pour le moment. (Connecte ta base Supabase et ajoute des produits dans la table <code>produits</code>.)
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {(produits as Produit[]).map((p) => (
            <ProduitCard key={p.id} produit={p} />
          ))}
        </div>
      )}
    </div>
  )
}
