import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PanierItem, Produit } from '@/types'

type PanierStore = {
  items: PanierItem[]
  ajouter: (produit: Produit, quantite?: number) => void
  retirer: (produitId: string) => void
  modifierQuantite: (produitId: string, quantite: number) => void
  vider: () => void
  total: () => number
}

export const usePanier = create<PanierStore>()(
  persist(
    (set, get) => ({
      items: [],
      ajouter: (produit, quantite = 1) => {
        const items = get().items
        const existant = items.find((i) => i.produit.id === produit.id)
        if (existant) {
          set({
            items: items.map((i) =>
              i.produit.id === produit.id
                ? { ...i, quantite: i.quantite + quantite }
                : i
            ),
          })
        } else {
          set({ items: [...items, { produit, quantite }] })
        }
      },
      retirer: (produitId) =>
        set({ items: get().items.filter((i) => i.produit.id !== produitId) }),
      modifierQuantite: (produitId, quantite) =>
        set({
          items: get().items.map((i) =>
            i.produit.id === produitId ? { ...i, quantite } : i
          ),
        }),
      vider: () => set({ items: [] }),
      total: () =>
        get().items.reduce((acc, i) => {
          const prix = i.produit.prix_promo ?? i.produit.prix
          return acc + prix * i.quantite
        }, 0),
    }),
    { name: 'ChinaPlaza-panier' }
  )
)
