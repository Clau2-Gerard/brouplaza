-- =========================================================
-- ChinaPlaza — SCHEMA SUPABASE (PostgreSQL)
-- =========================================================

-- Extension utile pour UUID
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- PROFILS UTILISATEUR (lié à auth.users)
-- ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client', -- client | admin | livreur
  ville text,
  quartier text,
  adresse text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  slug text unique not null,
  parent_id uuid references public.categories(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PRODUITS
-- ---------------------------------------------------------
create table public.produits (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  slug text unique not null,
  description text,
  prix numeric(12,2) not null,
  prix_promo numeric(12,2),
  stock integer not null default 0,
  categorie_id uuid references public.categories(id),
  images text[] default '{}',
  poids_kg numeric(6,2), -- pour calcul des frais d'expédition
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_produits_categorie on public.produits(categorie_id);
create index idx_produits_actif on public.produits(actif);

-- ---------------------------------------------------------
-- WISHLIST
-- ---------------------------------------------------------
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  produit_id uuid not null references public.produits(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, produit_id)
);

-- ---------------------------------------------------------
-- ZONES DE LIVRAISON (Douala) & TARIFS D'EXPEDITION (hors ville)
-- ---------------------------------------------------------
create table public.zones_livraison (
  id uuid primary key default gen_random_uuid(),
  nom text not null,         -- ex: Akwa, Bonamoussadi, Ndokoti...
  ville text not null default 'Douala',
  tarif numeric(10,2) not null,  -- frais de livraison locale
  delai_estime text,             -- ex: "Sous 24h"
  actif boolean not null default true
);

create table public.agences_expedition (
  id uuid primary key default gen_random_uuid(),
  nom text not null,          -- ex: "Le Tonnelier", "General Express"
  villes_desservies text[] default '{}',
  tarif_base numeric(10,2),
  tarif_par_kg numeric(10,2),
  contact text,
  actif boolean not null default true
);

-- ---------------------------------------------------------
-- COMMANDES
-- ---------------------------------------------------------
create table public.commandes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  numero text unique not null default ('CMD-' || substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  statut text not null default 'en_attente',
    -- en_attente | confirmee | en_preparation | expediee | livree | annulee
  type_livraison text not null,   -- 'locale' (Douala) | 'expedition' (hors ville)
  zone_livraison_id uuid references public.zones_livraison(id),
  agence_expedition_id uuid references public.agences_expedition(id),
  adresse_livraison text,
  ville_destination text,
  quartier_destination text,
  telephone_contact text not null,
  sous_total numeric(12,2) not null default 0,
  frais_livraison numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_commandes_user on public.commandes(user_id);
create index idx_commandes_statut on public.commandes(statut);

-- ---------------------------------------------------------
-- LIGNES DE COMMANDE
-- ---------------------------------------------------------
create table public.commande_items (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references public.commandes(id) on delete cascade,
  produit_id uuid references public.produits(id),
  nom_produit text not null,  -- snapshot au moment de l'achat
  prix_unitaire numeric(12,2) not null,
  quantite integer not null check (quantite > 0),
  sous_total numeric(12,2) not null
);

-- ---------------------------------------------------------
-- PAIEMENTS (Mobile Money, Orange Money, Cash à la livraison...)
-- ---------------------------------------------------------
create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references public.commandes(id) on delete cascade,
  methode text not null,       -- 'mtn_momo' | 'orange_money' | 'cash' | 'carte'
  statut text not null default 'en_attente', -- en_attente | reussi | echoue | rembourse
  montant numeric(12,2) not null,
  reference_externe text,       -- ID transaction du provider (CamPay, Notch Pay, etc.)
  payload jsonb,                 -- réponse brute du provider pour debug
  created_at timestamptz not null default now()
);

create index idx_paiements_commande on public.paiements(commande_id);

-- ---------------------------------------------------------
-- SUIVI DE LIVRAISON
-- ---------------------------------------------------------
create table public.suivi_livraison (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references public.commandes(id) on delete cascade,
  statut text not null,  -- en_preparation | en_route | livre | echec
  message text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================
alter table public.profiles enable row level security;
alter table public.produits enable row level security;
alter table public.categories enable row level security;
alter table public.wishlist enable row level security;
alter table public.commandes enable row level security;
alter table public.commande_items enable row level security;
alter table public.paiements enable row level security;
alter table public.zones_livraison enable row level security;
alter table public.agences_expedition enable row level security;
alter table public.suivi_livraison enable row level security;

-- Produits & catégories: lecture publique
create policy "produits_lecture_publique" on public.produits for select using (actif = true);
create policy "categories_lecture_publique" on public.categories for select using (true);
create policy "zones_lecture_publique" on public.zones_livraison for select using (actif = true);
create policy "agences_lecture_publique" on public.agences_expedition for select using (actif = true);

-- Profils: chacun voit/modifie le sien
create policy "profil_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profil_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profil_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Wishlist: chacun gère la sienne
create policy "wishlist_owner" on public.wishlist for all using (auth.uid() = user_id);

-- Commandes: chacun voit/crée les siennes
create policy "commandes_select_own" on public.commandes for select using (auth.uid() = user_id);
create policy "commandes_insert_own" on public.commandes for insert with check (auth.uid() = user_id);

-- Lignes de commande: visibles via la commande parente
create policy "commande_items_select_own" on public.commande_items for select
  using (exists (select 1 from public.commandes c where c.id = commande_id and c.user_id = auth.uid()));
create policy "commande_items_insert_own" on public.commande_items for insert
  with check (exists (select 1 from public.commandes c where c.id = commande_id and c.user_id = auth.uid()));

-- Paiements: visibles via la commande parente
create policy "paiements_select_own" on public.paiements for select
  using (exists (select 1 from public.commandes c where c.id = commande_id and c.user_id = auth.uid()));

-- Suivi: visible via la commande parente
create policy "suivi_select_own" on public.suivi_livraison for select
  using (exists (select 1 from public.commandes c where c.id = commande_id and c.user_id = auth.uid()));

-- NOTE: Pour l'admin, créer un rôle "admin" dans profiles et ajouter
-- des policies dédiées (using profiles.role = 'admin') pour la gestion
-- du catalogue, des commandes, etc.

-- =========================================================
-- DONNEES INITIALES (exemples)
-- =========================================================
insert into public.zones_livraison (nom, ville, tarif, delai_estime) values
  ('Ndokoti', 'Douala', 1000, 'Sous 24h'),
  ('Akwa', 'Douala', 1500, 'Sous 24h'),
  ('Bonamoussadi', 'Douala', 1500, 'Sous 24h'),
  ('Bonabéri', 'Douala', 2000, '24-48h'),
  ('Logbessou', 'Douala', 1500, 'Sous 24h');

insert into public.agences_expedition (nom, villes_desservies, tarif_base, tarif_par_kg, contact) values
  ('Le Tonnelier', array['Yaoundé','Bafoussam','Bamenda'], 2000, 500, '+237 6XX XXX XXX'),
  ('General Express Voyages', array['Yaoundé','Garoua','Maroua'], 2500, 600, '+237 6XX XXX XXX');
