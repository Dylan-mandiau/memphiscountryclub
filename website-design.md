# website-design.md — Memphis Country Club

Direction visuelle du site. Ce fichier est lu par Claude Code avant toute intervention sur l'UI.

---

## Direction générale

**Ambiance :** Moderne, épuré et **chaleureux** (révision 2026-05-21)
**Ton visuel :** propre, aéré, lisible, accueillant — interface qui s'efface pour mettre le contenu en avant tout en évoquant la convivialité d'une association de danse country
**Anti-pattern :** pas de surcharge décorative, pas de textures western clichées (bois, corde, chapeau), pas d'effets visuels inutiles. La chaleur vient de la **palette** et de la **typographie**, jamais d'images décoratives.

Le site doit inspirer confiance et être immédiatement utilisable par des membres de tous âges.

---

## Logo

**Statut :** logo existant — à fournir par Dylan  
**Format attendu :** SVG de préférence (ou PNG fond transparent, haute résolution)  
**Action :** déposer le fichier dans `public/logo.svg` (ou `public/logo.png`)

> ⚠️ Ne pas créer de logo de substitution. Utiliser un placeholder texte `[LOGO]` jusqu'à réception du fichier.

---

## Palette de couleurs (révision chaleureuse — 2026-05-21)

Palette inspirée des tons terre & lumière d'une grange un jour d'été : crème, terracotta, bruns chauds. Aucune teinte froide.

```css
/* Fonds — crème + beige tiède au lieu du blanc froid */
--color-background:   #FBF7F0;   /* fond principal, ivoire chaud */
--color-surface:      #F4ECDF;   /* sections alternées, cards */
--color-surface-alt:  #EFE4D1;   /* surface plus marquée si besoin */
--color-border:       #E6DBC9;   /* bordures, sable doux */

/* Texte — bruns chauds au lieu du noir */
--color-text-primary:    #2A1810;   /* titres et corps principal — brun très foncé */
--color-text-secondary:  #6B5B47;   /* texte secondaire, labels — taupe chaud */
--color-text-muted:      #A89B85;   /* placeholders, disabled */

/* Accent principal — terracotta (sienne brûlée) */
--color-accent:        #B8430E;   /* CTA principal, liens actifs, badges niveau */
--color-accent-light:  #FCE9D9;   /* fond doux pour badges, surlignages */
--color-accent-hover:  #9A3608;   /* hover */
--color-accent-soft:   #F5C9A8;   /* dégradés, accents discrets */

/* Accent secondaire — moutarde douce, à utiliser très ponctuellement */
--color-accent-2:        #C47F2C;
--color-accent-2-light:  #FBE9CC;

/* États */
--color-success:  #3F7A4F;   /* vert sapin atténué */
--color-warning:  #B7791F;
--color-error:    #B8430E;   /* identique à l'accent — intentionnel */
```

**Règles d'usage :**
- L'accent terracotta est utilisé avec parcimonie : CTA principal, élément actif du menu, badge de niveau
- `--color-accent-2` (moutarde) est réservé aux éléments d'exception (highlight d'une promo, badge "Nouveau") — ne jamais en mettre deux côte à côte avec l'accent terracotta
- Pas de couleurs vives en fond de grandes surfaces — réservé aux éléments interactifs
- Les sections alternent `background` et `surface` pour créer du rythme sans surcharge
- Si une grande image domine (Hero), conserver `surface` ou `background` comme cadre — pas de couleur saturée pleine page

---

## Typographie (révision chaleureuse — 2026-05-21)

Couplage **serif moderne / sans-serif** : Fraunces pour les titres (caractère + chaleur), Inter pour le corps (lisibilité).

```css
/* Titres — Fraunces, serif moderne avec axes optiques */
--font-display: var(--font-fraunces), Georgia, 'Times New Roman', serif;

/* Corps — Inter, sans-serif neutre lisible */
--font-body: var(--font-inter), system-ui, -apple-system, sans-serif;

/* Monospace (code, debug uniquement) */
--font-mono: 'JetBrains Mono', monospace;
```

Les variables `--font-fraunces` et `--font-inter` sont créées par `next/font/google` dans `src/app/layout.tsx`.

**Échelle typographique :**

| Élément | Taille | Poids | Famille | Usage |
|---------|--------|-------|---------|-------|
| H1 page | 2.75rem | 500 | Fraunces | Titre de section principale |
| H2 | 1.875rem | 500 | Fraunces | Sous-titres de section |
| H3 | 1.25rem | 600 | Fraunces | Titres de cards |
| Corps | 1rem | 400 | Inter | Texte courant |
| Small | 0.875rem | 400 | Inter | Métadonnées, dates, labels |
| XS | 0.75rem | 500 | Inter | Badges, tags |

**Règles :**
- Line-height corps : `1.65`
- Letter-spacing titres : `-0.01em` (resserrement léger pour cohésion visuelle)
- Pas de texte en dessous de `0.75rem`
- Uppercase réservé aux labels courts (badges de niveau : `DÉBUTANT`, `INTERMÉDIAIRE`)
- Fraunces uniquement sur les titres, jamais sur du paragraphe long (lisibilité)

---

## Espacement

Système basé sur une grille de 8px.

```css
--space-1:   4px;
--space-2:   8px;
--space-3:  12px;
--space-4:  16px;
--space-6:  24px;
--space-8:  32px;
--space-12: 48px;
--space-16: 64px;
--space-24: 96px;
```

**Marges de section :** `--space-16` à `--space-24` entre les grandes sections de page  
**Padding cards :** `--space-6` (24px)  
**Gap grille :** `--space-4` à `--space-6`

---

## Composants clés

### Carte de danse
```
┌─────────────────────────────────┐
│  [Badge niveau]  [Année saison] │
│                                 │
│  Titre de la danse              │
│                                 │
│  ▶ Vidéo démo  ▶ Apprentissage  │
│  📄 Fiche PDF                   │
└─────────────────────────────────┘
```
- Fond `--color-surface`
- Bordure `--color-border` fine (1px)
- Hover : légère élévation (`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`)
- Badge niveau : fond `--color-accent-light`, texte `--color-accent`, uppercase

### Filtres de la bibliothèque
- Boutons pill (bords arrondis complets)
- État inactif : fond surface, bordure border
- État actif : fond accent, texte blanc
- Transition smooth `200ms ease`

### Navigation principale
- Fond blanc, bordure bottom légère au scroll
- Logo à gauche, liens à droite
- Lien actif : couleur accent
- Mobile : menu hamburger → drawer latéral

### Albums galerie
- Grille responsive : 3 colonnes desktop, 2 tablette, 1 mobile
- Photo de couverture en format 16:9
- Titre et catégorie en bas de card
- Hover : légère opacité sur la couverture + icône "voir l'album"

---

## Responsive — points de rupture

```css
--breakpoint-sm:  640px;   /* mobile large */
--breakpoint-md:  768px;   /* tablette */
--breakpoint-lg: 1024px;   /* desktop */
--breakpoint-xl: 1280px;   /* grand écran */
```

**Mobile first** : toutes les règles CSS écrites pour mobile en premier, adaptées vers le haut.

---

## PWA mobile — spécificités design

La WebApp mobile (playlist des danses) suit les mêmes tokens de couleur et typographie que le site.

**Différences intentionnelles pour mobile :**
- Taille de touche minimum : `44px × 44px` sur tous les éléments interactifs
- Filtres en barre fixe en haut de l'écran (sticky)
- Cards de danses en liste verticale (pas de grille)
- Lecteur YouTube : pleine largeur, ratio 16:9
- Visionneuse PDF : plein écran avec bouton de fermeture bien visible

---

## Ce qu'il NE faut pas faire

- ❌ Pas de textures western, bois, corde, chapeau en décoration
- ❌ Pas de dégradés complexes sur les fonds
- ❌ Pas de polices décoratives type script ou serif chargées
- ❌ Pas d'animations de chargement longues ou complexes
- ❌ Pas de modales pour des actions simples
- ❌ Pas de couleurs vives multiples sur une même page
- ❌ Pas de texte blanc sur fond coloré sauf sur l'accent rouge brique

---

## À compléter par Dylan

- [ ] **Logo** : déposer dans `public/logo.svg`
- [ ] **Couleur d'accent** : valider le rouge brique `#C0392B` ou proposer une alternative
- [ ] **Police** : valider Inter ou choisir une autre Google Font
- [ ] **Références visuelles** : ajouter des liens vers des sites inspirants si trouvés
- [ ] **Favicon** : générer depuis le logo final
