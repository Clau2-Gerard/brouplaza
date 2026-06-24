export type CategorieNav = {
  nom: string
  slug: string
  sousCategories?: { nom: string; slug: string }[]
}

export const categoriesNav: CategorieNav[] = [
  {
    nom: 'Électronique',
    slug: 'electronique',
    sousCategories: [
      { nom: 'Téléphones & Accessoires', slug: 'telephones-accessoires' },
      { nom: 'Audio & Casques', slug: 'audio-casques' },
      { nom: 'Informatique', slug: 'informatique' },
      { nom: 'Power banks & chargeurs', slug: 'power-banks-chargeurs' },
    ],
  },
  {
    nom: 'Maison & Cuisine',
    slug: 'maison-cuisine',
    sousCategories: [
      { nom: 'Électroménager', slug: 'electromenager' },
      { nom: 'Décoration', slug: 'decoration' },
      { nom: 'Rangement', slug: 'rangement' },
    ],
  },
  {
    nom: 'Mode',
    slug: 'mode',
    sousCategories: [
      { nom: 'Vêtements homme', slug: 'vetements-homme' },
      { nom: 'Vêtements femme', slug: 'vetements-femme' },
      { nom: 'Chaussures', slug: 'chaussures' },
      { nom: 'Sacs & accessoires', slug: 'sacs-accessoires' },
    ],
  },
  {
    nom: 'Beauté & Santé',
    slug: 'beaute-sante',
    sousCategories: [
      { nom: 'Soins du corps', slug: 'soins-corps' },
      { nom: 'Cosmétiques', slug: 'cosmetiques' },
    ],
  },
  {
    nom: 'Sport & Loisirs',
    slug: 'sport-loisirs',
    sousCategories: [
      { nom: 'Fitness', slug: 'fitness' },
      { nom: 'Jouets', slug: 'jouets' },
    ],
  },
]

export type LienRapide = { label: string; href: string }

export const liensRapides: LienRapide[] = [
  { label: 'Catalogue', href: '/' },
  { label: 'Annonces', href: '/annonces' },
  { label: 'Promotions', href: '/promotions' },
  { label: 'Nouveautés', href: '/nouveautes' },
  { label: 'Annonces', href: '/a' },
]
