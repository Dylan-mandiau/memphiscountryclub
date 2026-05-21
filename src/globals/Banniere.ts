import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { publicRead } from '../access/hasRole'

/**
 * Hero bannière de la page d'accueil — éditable par le Super Admin.
 * Permet d'uploader une photo principale (typiquement la photo des membres)
 * + jusqu'à 6 photos additionnelles affichées en bandeau sous le hero.
 *
 * Accès :
 * - Lecture publique
 * - Modification : admin uniquement (Dylan / Super Admin — CDC §7)
 */
export const Banniere: GlobalConfig = {
  slug: 'banniere',
  label: 'Bannière d’accueil',
  admin: {
    group: 'Apparence',
    description:
      'Personnalise le hero de la page d’accueil. Glisse la photo des membres dans « Image principale ».',
  },
  access: {
    read: publicRead,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenu',
          fields: [
            {
              name: 'titre',
              label: 'Titre principal',
              type: 'text',
              required: true,
              defaultValue: 'Memphis Country Club',
            },
            {
              name: 'sous_titre',
              label: 'Sous-titre',
              type: 'textarea',
              defaultValue:
                'Association de danse country à Villeneuve-d’Ascq — Cours, démos, événements toute l’année.',
            },
            {
              name: 'cta_texte',
              label: 'Bouton principal — Texte',
              type: 'text',
              defaultValue: 'Voir les danses',
            },
            {
              name: 'cta_lien',
              label: 'Bouton principal — Lien',
              type: 'text',
              defaultValue: '/danses',
            },
            {
              name: 'cta_secondaire_texte',
              label: 'Bouton secondaire — Texte',
              type: 'text',
              defaultValue: 'Se rendre aux cours',
            },
            {
              name: 'cta_secondaire_lien',
              label: 'Bouton secondaire — Lien',
              type: 'text',
              defaultValue: '/acces',
            },
          ],
        },
        {
          label: 'Image principale',
          fields: [
            {
              name: 'image',
              label: 'Image principale (photo des membres recommandée)',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: {
                description:
                  'Photo affichée en grand à droite du titre. Format paysage recommandé (ratio 4:3 ou 16:9). Aucune limite de taille.',
              },
            },
            {
              name: 'image_alt',
              label: 'Texte alternatif (accessibilité)',
              type: 'text',
              defaultValue: 'Les membres du Memphis Country Club',
            },
            {
              name: 'style',
              label: 'Style d’affichage',
              type: 'select',
              defaultValue: 'cote-a-cote',
              options: [
                { label: 'Image à côté du texte (recommandé)', value: 'cote-a-cote' },
                {
                  label: 'Image en fond avec overlay sombre',
                  value: 'fond-overlay',
                },
                { label: 'Texte seul (pas d’image)', value: 'texte-seul' },
              ],
              admin: {
                description:
                  '« Fond + overlay » : la photo prend toute la largeur, le texte est dessus avec un voile sombre pour la lisibilité.',
              },
            },
          ],
        },
        {
          label: 'Galerie membres',
          fields: [
            {
              name: 'galerie_membres',
              label: 'Photos additionnelles des membres',
              type: 'array',
              maxRows: 6,
              admin: {
                description:
                  'Jusqu’à 6 photos affichées en bandeau sous le hero. Laisse vide si tu n’en veux pas.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  filterOptions: { mimeType: { contains: 'image' } },
                },
                {
                  name: 'legende',
                  label: 'Légende (optionnelle)',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
