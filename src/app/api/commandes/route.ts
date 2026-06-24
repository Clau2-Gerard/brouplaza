import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CommandeItem, TypeLivraison, MethodePaiement } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json()
  const {
    items,
    type_livraison,
    zone_livraison_id,
    ville_expedition_id,
    agence_expedition_id,
    nom_client,
    adresse_livraison,
    ville_destination,
    telephone_contact,
    sous_total,
    frais_livraison,
    total,
    methode_paiement,
  }: {
    items: CommandeItem[]
    type_livraison: TypeLivraison
    zone_livraison_id: string | null
    ville_expedition_id: string | null
    agence_expedition_id: string | null
    nom_client: string
    adresse_livraison: string
    ville_destination: string
    telephone_contact: string
    sous_total: number
    frais_livraison: number
    total: number
    methode_paiement: MethodePaiement
  } = body

  // 1. Créer la commande
  const { data: commande, error: errCommande } = await supabase
    .from('commandes')
    .insert({
      user_id: user?.id ?? null,
      statut: 'en_attente',
      type_livraison,
      zone_livraison_id,
      ville_expedition_id,
      agence_expedition_id,
      nom_client,
      adresse_livraison,
      ville_destination,
      telephone_contact,
      sous_total,
      frais_livraison,
      total,
    })
    .select()
    .single()

  if (errCommande || !commande) {
    return NextResponse.json({ error: errCommande?.message ?? 'Erreur création commande' }, { status: 500 })
  }

  // 2. Insérer les lignes de commande
  const { error: errItems } = await supabase.from('commande_items').insert(
    items.map((item) => ({ ...item, commande_id: commande.id }))
  )
  if (errItems) {
    return NextResponse.json({ error: errItems.message }, { status: 500 })
  }

  // 3. Créer l'enregistrement de paiement (en attente)
  // NOTE: L'intégration réelle avec CamPay / Notch Pay / MTN MoMo API
  // se fera ici : initier la transaction et stocker la référence.
  const { error: errPaiement } = await supabase.from('paiements').insert({
    commande_id: commande.id,
    methode: methode_paiement,
    statut: methode_paiement === 'mtn_momo' || methode_paiement === 'orange_money' ? 'en_attente' : 'en_attente',
    montant: total,
  })
  if (errPaiement) {
    return NextResponse.json({ error: errPaiement.message }, { status: 500 })
  }

  return NextResponse.json({ commande }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ commandes: [] })

  const { data: commandes } = await supabase
    .from('commandes')
    .select('*, commande_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ commandes })
}
