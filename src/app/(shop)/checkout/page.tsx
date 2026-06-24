'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePanier } from '@/lib/store/panier'
import { createClient } from '@/lib/supabase/client'
import type { ZoneLivraison, VilleExpedition, AgenceExpedition, MethodePaiement } from '@/types'

function formatFCFA(montant: number) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

export default function CheckoutPage() {
  const { items, total, vider } = usePanier()
  const [typeLivraison, setTypeLivraison] = useState<'locale' | 'expedition'>('locale')
  const [zones, setZones] = useState<ZoneLivraison[]>([])
  const [villes, setVilles] = useState<VilleExpedition[]>([])
  const [toutesAgences, setToutesAgences] = useState<AgenceExpedition[]>([])
  const [villeId, setVilleId] = useState('')
  const [agenceId, setAgenceId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [nomClient, setNomClient] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [methodePaiement, setMethodePaiement] = useState<MethodePaiement>('mtn_momo')
  const [chargement, setChargement] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('zones_livraison').select('*').eq('actif', true).then(({ data }) => setZones(data ?? []))
    supabase.from('villes_expedition').select('*').eq('actif', true).then(({ data }) => setVilles(data ?? []))
    supabase.from('agences_expedition').select('*').eq('actif', true).then(({ data }) => setToutesAgences(data ?? []))
  }, [])

  // Ville actuellement sélectionnée
  const villeSelectionnee = useMemo(() => villes.find((v) => v.id === villeId), [villes, villeId])

  // Agences filtrées : uniquement celles desservant la ville choisie
  const agencesDisponibles = useMemo(() => {
    if (!villeSelectionnee) return []
    return toutesAgences.filter((a) => villeSelectionnee.agences_desservies.includes(a.id))
  }, [villeSelectionnee, toutesAgences])

  // Quand on change de ville, on réinitialise l'agence choisie (elle peut ne plus être valide)
  useEffect(() => {
    setAgenceId('')
  }, [villeId])

  const fraisLivraison =
    typeLivraison === 'locale'
      ? zones.find((z) => z.id === zoneId)?.tarif ?? 0
      : villeSelectionnee?.tarif_base ?? 0

  const totalCommande = total() + fraisLivraison

  async function passerCommande() {
    setChargement(true)
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ produit, quantite }) => ({
            produit_id: produit.id,
            nom_produit: produit.nom,
            prix_unitaire: produit.prix_promo ?? produit.prix,
            quantite,
            sous_total: (produit.prix_promo ?? produit.prix) * quantite,
          })),
          type_livraison: typeLivraison,
          zone_livraison_id: typeLivraison === 'locale' ? zoneId : null,
          ville_expedition_id: typeLivraison === 'expedition' ? villeId : null,
          agence_expedition_id: typeLivraison === 'expedition' ? agenceId : null,
          nom_client: nomClient,
          adresse_livraison: adresse,
          ville_destination: villeSelectionnee?.nom ?? '',
          telephone_contact: telephone,
          sous_total: total(),
          frais_livraison: fraisLivraison,
          total: totalCommande,
          methode_paiement: methodePaiement,
        }),
      })
      if (!res.ok) throw new Error('Erreur lors de la création de la commande')
      vider()
      alert('Commande passée avec succès ! Vous recevrez une confirmation par SMS.')
    } catch (e) {
      alert('Une erreur est survenue. Réessayez.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <h1 className="text-xl font-bold text-white">Finaliser la commande</h1>

        {/* Type de livraison */}
        <div className="rounded-xl border bg-white self-center p-4">
          <h2 className="mb-3 font-semibold">Mode de livraison</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setTypeLivraison('locale')}
              className={`flex-1 rounded-lg border p-3 text-sm ${typeLivraison === 'locale' ? 'border-orange-600 bg-orange-50' : ''}`}
            >
              🏠 Livraison à Douala
            </button>
            <button
              onClick={() => setTypeLivraison('expedition')}
              className={`flex-1 rounded-lg border p-3 text-sm ${typeLivraison === 'expedition' ? 'border-orange-600 bg-orange-50' : ''}`}
            >
              🚚 Expédition (autre ville)
            </button>
          </div>

          {typeLivraison === 'locale' ? (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">Quartier (Douala)</label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full rounded-lg border p-2 text-sm"
              >
                <option value="">Sélectionner un quartier</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nom} — {formatFCFA(z.tarif)} ({z.delai_estime})
                  </option>
                ))}
              </select>
              <input
                placeholder="Adresse précise (rue, repère...)"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="mt-2 w-full rounded-lg border p-2 text-sm"
              />
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <label className="mb-1 block text-sm font-medium">Ville de destination</label>
              <select
                value={villeId}
                onChange={(e) => setVilleId(e.target.value)}
                className="w-full rounded-lg border p-2 text-sm"
              >
                <option value="">Sélectionner une ville</option>
                {villes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nom} — à partir de {formatFCFA(v.tarif_base)}
                  </option>
                ))}
              </select>

              <label className="mb-1 block text-sm font-medium">Agence d&apos;expédition</label>
              <select
                value={agenceId}
                onChange={(e) => setAgenceId(e.target.value)}
                disabled={!villeId}
                className="w-full rounded-lg border p-2 text-sm disabled:bg-neutral-100"
              >
                <option value="">
                  {villeId ? 'Sélectionner une agence' : 'Choisissez d\'abord une ville'}
                </option>
                {agencesDisponibles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nom}
                  </option>
                ))}
              </select>
              {villeId && agencesDisponibles.length === 0 && (
                <p className="text-xs text-red-500">Aucune agence ne dessert cette ville pour le moment.</p>
              )}
            </div>
          )}

          <div className="mt-4">
            <input
              placeholder="Votre Nom (celui du récepteur du colis)"
              value={nomClient}
              onChange={(e) => setNomClient(e.target.value)}
              className="mt-2 w-full rounded-lg border p-2 text-sm"
            />
            <input
              placeholder="Numéro de téléphone (contact)"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="mt-2 w-full rounded-lg border p-2 text-sm"
            />
          </div>
        </div>

        {/* Paiement */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 font-semibold">Méthode de paiement</h2>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['mtn_momo', 'MTN MoMo'],
              ['orange_money', 'Orange Money'],
            ] as [MethodePaiement, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setMethodePaiement(val)}
                className={`rounded-lg border p-3 text-sm ${methodePaiement === val ? 'border-orange-600 bg-orange-50' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="h-fit rounded-xl border bg-white p-4 self-center md:sticky md:top-4">
        <h2 className="mb-3 font-semibold">Résumé</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Sous-total</span><span>{formatFCFA(total())}</span></div>
          <div className="flex justify-between"><span>Livraison</span><span>{formatFCFA(fraisLivraison)}</span></div>
          <div className="mt-2 flex justify-between border-t pt-2 font-bold"><span>Total</span><span>{formatFCFA(totalCommande)}</span></div>
        </div>
        <button
          onClick={passerCommande}
          disabled={chargement || items.length === 0 || !telephone || (typeLivraison === 'expedition' && !agenceId)}
          className="mt-4 w-full rounded-full bg-orange-600 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {chargement ? 'Envoi...' : 'Confirmer la commande'}
        </button>
      </div>
    </div>
  )
}
