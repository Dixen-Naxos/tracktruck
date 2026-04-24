@AGENTS.md

# TrackTruck Web — Guide complet

## Projet

TrackTruck est une plateforme de gestion de flotte de poids lourds. Ce dépôt est le **frontend uniquement** — il appelle une API REST backend séparée. Deux profils utilisateurs :

- **Chauffeur** — module opérationnel (app mobile, hors scope ici)
- **Administrateur** — module supervision (ce frontend web)

---

## Stack technique

| Outil | Version |
|---|---|
| Next.js | 16.2.4 |
| React | 19.2.4 |
| TypeScript | 5 (strict) |
| Tailwind CSS | v4 |
| Fetch | natif (pas d'axios ni de librairie HTTP) |

**Zéro dépendance UI externe.** Pas de shadcn, radix, headlessui, etc. Tout est construit à la main avec Tailwind + CSS variables.

---

## Structure des fichiers

```
src/
  app/                  # App Router Next.js
    layout.tsx          # Racine : AppProvider + Sidebar + TopBar + TweaksPanel + ToastStack
    page.tsx            # Redirige vers /chauffeurs
    carte/page.tsx      # Carte temps réel de la flotte
    chauffeurs/page.tsx # Gestion des chauffeurs
    commandes/page.tsx  # Gestion des commandes (à implémenter)
    dashcam/page.tsx    # Enregistrements dashcam (à implémenter)
    signalements/page.tsx # Signalements chauffeurs (à implémenter)
  components/
    primitives.tsx      # Composants UI de base (voir section dédiée)
    icons.tsx           # Icônes SVG inline
    Sidebar.tsx         # Navigation principale
    TopBar.tsx          # Barre supérieure (horloge, notifs, statut système)
    TweaksPanel.tsx     # Panneau de préférences (thème, carte, sidebar)
    ToastStack.tsx      # File de notifications
    SchematicMap.tsx    # Carte SVG de la flotte
    chauffeurs/
      DriverCard.tsx    # Carte / ligne de chauffeur
      DriverModal.tsx   # Fiche détaillée (4 onglets)
      CreateDrawer.tsx  # Drawer de création
  context/
    AppContext.tsx       # Contexte global unique (toasts, tweaks, navigation)
  lib/
    types.ts            # Types domaine (source de vérité)
    api.ts              # Couche API (actuellement in-memory — voir section API)
    data.ts             # Données statiques de seed
```

---

## Conventions de code

### Composants
- **Toujours** `"use client"` en première ligne de chaque page et composant interactif — pas de Server Components.
- Nommage : `PascalCase` pour les composants, `camelCase` pour les variables/fonctions.
- Constantes globales : `UPPER_SNAKE_CASE` (ex. `SKILLS`, `DRIVERS`, `STATUS_META`).
- Props : handlers préfixés `on*` (`onClose`, `onToast`), setters `set*`.
- Booléens : `is*`, `*Open`, `*Loading`.

### Imports
- Alias `@/*` → `src/*` (ex. `import { Btn } from "@/components/primitives"`).
- Toujours importer les types avec `import type { ... }`.

### Commentaires
- Aucun commentaire par défaut.
- Seulement si le POURQUOI est non-obvieux (contrainte cachée, invariant subtil, contournement de bug).
- Ne jamais expliquer CE QUE fait le code.

---

## Système de design

### Tokens CSS (toujours utiliser `var(--token)`, jamais de hex en dur)

```
Couleurs principales
  --accent          Bleu-violet principal (OKLCH)
  --accent-soft     Version atténuée de l'accent
  --accent-softer   Version très atténuée
  --accent-ink      Texte sur fond accent

Surfaces & texte
  --bg              Fond de page
  --surface         Surface de carte / panneau
  --surface-2       Surface secondaire (légèrement plus sombre)
  --ink-1           Texte principal (très foncé)
  --ink-2           Texte secondaire
  --ink-3           Texte tertiaire / placeholder
  --ink-4           Texte désactivé / très atténué
  --line            Séparateur standard
  --line-strong     Séparateur accentué

Sémantique
  --success         Vert
  --warn            Or / jaune
  --danger          Rouge

Ombres
  --shadow-sm       Subtile (1-2px)
  --shadow-md       Moyenne (4-16px)
  --shadow-lg       Prononcée (20-60px + inset)
```

### Animations
- Timing standard : `.28s cubic-bezier(.2,.8,.2,1)`
- Classes utilitaires custom (préfixe `.tt-*`) :
  - `.tt-hover-lift` — élévation au survol (transform + shadow)
  - `.tt-pulse` — pulsation continue
  - `.tt-toast-in` / `.tt-modal-in` / `.tt-fade-in` / `.tt-row-in` — entrées animées

### Dark mode
- Contrôlé via `document.body.dataset.theme = "dark" | "light"`.
- Tous les tokens CSS s'adaptent automatiquement.

---

## Primitives disponibles (`@/components/primitives`)

| Composant | Usage |
|---|---|
| `<PageHeader title subtitle>` | En-tête de page avec zone d'actions |
| `<Card>` | Conteneur surface avec bordure + ombre |
| `<Btn variant size>` | Bouton (variants: primary / secondary / ghost / soft / danger) |
| `<Avatar name tone size ring>` | Cercle avec initiales |
| `<StatusDot status pulse>` | Point coloré de statut |
| `<StatusPill status>` | Badge statut (point + label) |
| `<KeyStat label value delta tone>` | KPI chiffré |
| `<Segment value onChange options>` | Toggle group générique `<T extends string>` |
| `<SearchInput value onChange placeholder>` | Champ de recherche avec icône |
| `<SkillTag label variant>` | Badge de compétence (default / accent / warn) |
| `<Hairline vertical>` | Séparateur |
| `<Kbd>` | Raccourci clavier |

---

## Icônes (`@/components/icons`)

```tsx
import { Icon } from "@/components/icons"
// Noms disponibles (type IconName) :
// map, users, box, video, alert, bell, search, plus, chevronR, close,
// phone, mail, truck, star, filter, calendar, logout, moon, sun,
// sidebar, gear, sparkle, edit, check, pin, clock, license, globe, help
<Icon name="truck" size={20} strokeWidth={1.8} />
```

---

## Contexte global (`@/context/AppContext`)

```tsx
import { useApp } from "@/context/AppContext"

const { toast, tweaks, setTweak, tweaksOpen, setTweaksOpen, active, setActive } = useApp()

toast("Message", "success")   // kinds: "info" | "success" | "warn" — expire après 3500ms
tweaks.theme                   // "light" | "dark"
tweaks.mapStyle                // "schematic" | "realistic"
tweaks.sidebarVariant          // "expanded" | "compact"
```

---

## Couche API (`@/lib/api`)

`src/lib/api.ts` est **la seule couche qui communique avec le backend**.

### Architecture

```
request<T>(method, path, body?)   ← fonction généraliste (un seul endroit pour headers, erreurs, base URL)
     │
     ├── ApiDrivers.list()         ← services par domaine, contiennent juste la route
     ├── ApiDrivers.get(id)
     ├── ApiOrders.list()
     ├── ApiDashcam.list()
     └── ...
```

### Basculer vers le vrai backend

Dans `request()`, supprimer le bloc `_devStub` et décommenter le `fetch`. Aucun autre fichier ne change.

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
```

### Ajouter un service pour une nouvelle entité

```typescript
// 1. Définir le type dans src/lib/types.ts
export interface Order { id: string; ... }

// 2. Ajouter le service dans src/lib/api.ts
export const ApiOrders = {
  list:   ()                          => request<Order[]>("GET",    "/api/orders"),
  get:    (id: string)                => request<Order> ("GET",    `/api/orders/${id}`),
  create: (input: Omit<Order, "id">) => request<Order> ("POST",   "/api/orders", input),
  update: (id: string, patch: Partial<Order>) => request<Order>("PATCH", `/api/orders/${id}`, patch),
  cancel: (id: string, reason: string)        => request<void>("POST",  `/api/orders/${id}/cancel`, { reason }),
}

// 3. Ajouter le stub dans _devStub() pour le dev sans backend
```

### Services existants

| Service | Routes couvertes |
|---|---|
| `ApiDrivers` | `GET /api/drivers`, `GET /api/drivers/:id`, `POST`, `PATCH`, `DELETE` |
| `ApiOrders` | commenté — décommenter quand `Order` est défini |
| `ApiDashcam` | commenté — décommenter quand `VideoRecord` est défini |
| `ApiIncidents` | commenté — décommenter quand `Incident` est défini |

- Les types retournés sont définis dans `src/lib/types.ts`.
- IDs : format `"DOMAINE-XXXX"` (ex. `"D-4A2B"` pour un driver, `"O-7F3C"` pour une commande).

---

## Types domaine (`@/lib/types`)

Types existants :

```typescript
type DriverStatus = "en-service" | "disponible" | "repos" | "conges"
type SkillFamily  = "Permis" | "Habilitation" | "Matériel" | "Opérationnel" | "Zone"
type ViewKey      = "carte" | "chauffeurs" | "commandes" | "dashcam" | "signalements"
type ThemeMode    = "light" | "dark"
type MapStyle     = "schematic" | "realistic"
type SidebarVariant = "expanded" | "compact"
type ToastKind    = "info" | "success" | "warn"

interface Driver { id, name, status, rating, missions, phone, email, vehicle,
                   license, skills[], zones[], availability, recentMissions[], metrics }
interface Vehicle { id, driverId, status, load, eta, from, to }
interface Skill   { id, label, family, description }
interface Availability { mon, tue, wed, thu, fri, sat, sun }  // 0 | 1
```

Toute nouvelle entité (Order, Incident, VideoRecord…) est ajoutée ici.

---

## Use cases à implémenter — Module Supervision

### UC-SUP-01 — Authentification administrateur `[HAUTE]`
Page de login. Profil admin = accès aux deux modules.

### UC-SUP-02 — Carte interactive temps réel `[HAUTE]`
Page `/carte` (base existante). Marqueurs GPS mis à jour en temps réel, itinéraires prévus vs parcourus, fiche véhicule au clic, filtres (statut / chauffeur / zone).

### UC-SUP-03 — Alertes incidents routiers `[HAUTE]`
Surveillance continue des sources trafic (API temps réel, événements sportifs, travaux). Alerte si incident sur itinéraire actif ou planifié, avec véhicules concernés + impact estimé.

### UC-SUP-04 — Suggestion et validation d'itinéraire alternatif `[HAUTE]`
Déclenchée par UC-SUP-03. Suggestions générées automatiquement (autre itinéraire ou autre chauffeur ou prestataire externe). Décision tracée dans l'historique commande.

### UC-SUP-05 — Dessin manuel d'un itinéraire `[MOYENNE]`
Ajout / déplacement / suppression de points de passage sur la carte. Recalcul + estimation avant validation. Envoi au chauffeur à la validation.

### UC-SUP-06 — Calcul automatique d'itinéraire optimisé `[HAUTE]`
Déclenché à la création de commande. Paramètres : charge véhicule, coûts (carburant, péages, usure), contraintes réglementaires (gabarit, poids), trafic prévisible. Validation explicite requise avant envoi au chauffeur. Classement par coût si équivalents.

### UC-SUP-07 — Traitement d'un signalement : replanification ou annulation `[HAUTE]`
Depuis la fiche signalement : actions "Replanifier" (→ UC-SUP-05/06) et "Annuler le parcours" (retour entrepôt calculé automatiquement). Décision horodatée + identité de l'admin tracées.

### UC-SUP-08 — Estimation du coût d'un parcours `[MOYENNE]`
Distance + durée + carburant + péages + surcoûts prévisibles (événements, météo). Exportable ou intégré à la fiche commande.

### UC-SUP-09 — Gestion des chauffeurs et compétences `[HAUTE]`
Page `/chauffeurs` (base existante). Créer / modifier / désactiver un profil, associer compétences et certifications, gérer les disponibilités (congés, plages horaires), consulter l'historique des missions.

### UC-SUP-10 — Validation commande + attribution chauffeur `[HAUTE]`
Création commande (date, horaire, origine, destination, type marchandise, compétences requises). Attribution automatique du meilleur chauffeur disponible. Classement si plusieurs éligibles. Commande non attribuée → statut "En attente" + alerte (→ UC-SUP-11).

### UC-SUP-11 — Alerte : aucun chauffeur disponible `[HAUTE]`
Notification in-app + e-mail immédiate. Actions depuis l'alerte : modifier la date, forcer attribution manuelle, rechercher prestataire externe. Alerte active tant que commande non attribuée.

### UC-SUP-12 — Consultation des signalements chauffeurs `[HAUTE]`
Page `/signalements` (placeholder existant). Liste avec date, heure, chauffeur, type, localisation, commentaire. Filtres (statut: non traité / en cours / résolu, type, chauffeur). Changement de statut + note de suivi + action corrective (→ UC-SUP-07). Archivage des résolus.

### UC-SUP-13 — Agenda des commandes `[HAUTE]`
Vues jour / semaine / mois. Statut et chauffeur affectés visibles. Clic → fiche détaillée. Filtres chauffeur / statut / zone.

### UC-SUP-14 — Lecture des enregistrements dashcam `[HAUTE]`
Page `/dashcam` (placeholder existant). Accès depuis la fiche commande. Lecteur intégré (lecture, pause, navigation horodatage). Accès réservé aux profils autorisés. Journal d'accès par vidéo.

### UC-SUP-15 — Politique de suppression automatique des vidéos `[MOYENNE]`
Durée de rétention configurable (30 / 60 / 90 jours). Suppression automatique sauf si vidéo annotée (→ UC-SUP-16). Rapport de suppression archivé. Nouvelle politique s'applique aux nouvelles vidéos seulement.

### UC-SUP-16 — Annotation vidéo pour conservation permanente `[MOYENNE]`
Annotation textuelle (motif, référence dossier). Vidéo annotée exclue de la suppression auto. Statut "Conservée" visible dans la liste. Modifications d'annotation tracées.

---

## Règles métier transversales

| Réf | Règle |
|---|---|
| RMT-01 | Toute action critique (validation commande, modification itinéraire, suppression vidéo) est tracée : identité de l'auteur + horodatage. |
| RMT-02 | Un chauffeur n'accède qu'au module opérationnel. Un admin accède aux deux. |
| RMT-03 | Données GPS et vidéo chiffrées en transit (TLS) et au repos. |
| RMT-04 | Notifications critiques (incidents, alertes trafic) délivrées en < 30 secondes après détection. |
| RMT-05 | En cas d'indisponibilité réseau, données locales (GPS, signalements) synchronisées au rétablissement. |

---

## Ce qu'il ne faut PAS faire

- Installer une librairie UI externe (shadcn, radix, mantine…) sans accord explicite.
- Utiliser des couleurs hex en dur — toujours `var(--token)`.
- Créer des Server Components — tout est `"use client"`.
- Sauter la lecture des docs Next.js dans `node_modules/next/dist/docs/` avant d'écrire du code Next.js.
- Ajouter des commentaires qui décrivent CE QUE fait le code.
- Implémenter des fonctionnalités non demandées.
- Dupliquer la logique qui existe déjà dans `primitives.tsx` ou `api.ts`.