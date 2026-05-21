/**
 * Script de seed — crée les saisons existantes et niveaux par défaut.
 * Exécution : npm run seed
 *
 * Saisons (CDC §4.1) : 2017-2018 à 2025-2026 sauf 2020-2021 (COVID).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const niveaux = [
  { nom: 'Débutant', slug: 'debutant', ordre: 1 },
  { nom: 'Intermédiaire', slug: 'intermediaire', ordre: 2 },
  { nom: 'Démonstration', slug: 'demonstration', ordre: 3 },
]

const saisons = [
  '2017-2018',
  '2018-2019',
  '2019-2020',
  '2021-2022',
  '2022-2023',
  '2023-2024',
  '2024-2025',
  '2025-2026',
]

const categoriesAlbums = [
  'BAL',
  'Assemblée Générale',
  'Démonstrations',
  'Foire aux Assos',
  'Saison 2023',
  'Saison 2024',
]

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const main = async () => {
  const payload = await getPayload({ config })
  console.log('→ Seed niveaux…')
  for (const n of niveaux) {
    const exists = await payload.find({
      collection: 'niveaux',
      where: { slug: { equals: n.slug } },
      limit: 1,
    })
    if (exists.docs.length === 0) {
      await payload.create({ collection: 'niveaux', data: n })
      console.log('  + ' + n.nom)
    }
  }
  console.log('→ Seed saisons…')
  for (const lib of saisons) {
    const exists = await payload.find({
      collection: 'saisons',
      where: { libelle: { equals: lib } },
      limit: 1,
    })
    if (exists.docs.length === 0) {
      const annee_debut = Number(lib.split('-')[0])
      await payload.create({
        collection: 'saisons',
        data: { libelle: lib, annee_debut },
      })
      console.log('  + ' + lib)
    }
  }
  console.log('→ Seed catégories albums…')
  for (const nom of categoriesAlbums) {
    const slug = slugify(nom)
    const exists = await payload.find({
      collection: 'categories-albums',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (exists.docs.length === 0) {
      await payload.create({
        collection: 'categories-albums',
        data: { nom, slug },
      })
      console.log('  + ' + nom)
    }
  }
  console.log('OK — seed terminé.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
