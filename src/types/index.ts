export type Produit = {
  id: string
  nom: string
  slug: string
  description: string | null
  prix: number
  prix_promo: number | null
  stock: number
  categorie_id: string | null
  images: string[]
  poids_kg: number | null
  actif: boolean
}

export type Categorie = {
  id: string
  nom: string
  slug: string
  parent_id: string | null
}

export type ZoneLivraison = {
  id: string
  nom: string
  ville: string
  tarif: number
  delai_estime: string | null
}

export type VilleExpedition ={
  id: string
  nom: string
  agences_desservies: string[]
  tarif_base: number
}

export type AgenceExpedition = {
  id: string
  nom: string
  tarif_par_kg: number | null
  contact: string | null
}

export type CommandeItem = {
  produit_id: string
  nom_produit: string
  prix_unitaire: number
  quantite: number
  sous_total: number
}

export type TypeLivraison = 'locale' | 'expedition'

export type Commande = {
  id: string
  numero: string
  statut: 'en_attente' | 'confirmee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee'
  type_livraison: TypeLivraison
  sous_total: number
  frais_livraison: number
  total: number
  created_at: string
}

export type MethodePaiement = 'mtn_momo' | 'orange_money' 

// Panier (stocké côté client, ex: localStorage / Zustand)
export type PanierItem = {
  produit: Produit
  quantite: number
}
