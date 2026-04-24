# TrackTruck — Spécification des Use Cases

> **Version :** 1.0 · **Date :** Avril 2026 · **Statut :** En cours de révision

---

## Table des matières

1. [Module Opérationnel (Chauffeur)](#1-module-opérationnel-chauffeur)
   - [UC-OP-01 — Authentification du chauffeur](#uc-op-01--authentification-du-chauffeur)
   - [UC-OP-02 — Démarrage du service et affichage de l'itinéraire](#uc-op-02--démarrage-du-service-et-affichage-de-litinéraire)
   - [UC-OP-03 — Activation de la dashcam](#uc-op-03--activation-de-la-dashcam)
   - [UC-OP-04 — Réception d'une alerte d'incident](#uc-op-04--réception-dune-alerte-dincident)
   - [UC-OP-05 — Signalement d'un incident](#uc-op-05--signalement-dun-incident)
2. [Module Supervision (Administrateur)](#2-module-supervision-administrateur)
   - [UC-SUP-01 — Authentification de l'administrateur](#uc-sup-01--authentification-de-ladministrateur)
   - [UC-SUP-02 — Visualisation de la flotte sur carte interactive](#uc-sup-02--visualisation-de-la-flotte-sur-carte-interactive)
   - [UC-SUP-03 — Alerte sur incidents routiers à venir](#uc-sup-03--alerte-sur-incidents-routiers-à-venir)
   - [UC-SUP-04 — Suggestion et validation d'un itinéraire alternatif](#uc-sup-04--suggestion-et-validation-dun-itinéraire-alternatif)
   - [UC-SUP-05 — Dessin manuel d'un itinéraire](#uc-sup-05--dessin-manuel-dun-itinéraire)
   - [UC-SUP-06 — Estimation du coût d'un parcours](#uc-sup-06--estimation-du-coût-dun-parcours)
   - [UC-SUP-07 — Gestion des chauffeurs et de leurs compétences](#uc-sup-07--gestion-des-chauffeurs-et-de-leurs-compétences)
   - [UC-SUP-08 — Validation d'une commande et attribution d'un chauffeur](#uc-sup-08--validation-dune-commande-et-attribution-dun-chauffeur)
   - [UC-SUP-09 — Alerte : aucun chauffeur attribué à une commande](#uc-sup-09--alerte--aucun-chauffeur-attribué-à-une-commande)
   - [UC-SUP-10 — Consultation des signalements des chauffeurs](#uc-sup-10--consultation-des-signalements-des-chauffeurs)
   - [UC-SUP-11 — Visualisation des commandes via un agenda](#uc-sup-11--visualisation-des-commandes-via-un-agenda)
   - [UC-SUP-12 — Lecture des enregistrements dashcam](#uc-sup-12--lecture-des-enregistrements-dashcam)
   - [UC-SUP-13 — Politique de suppression automatique des vidéos](#uc-sup-13--politique-de-suppression-automatique-des-vidéos)
   - [UC-SUP-14 — Annotation d'une vidéo pour conservation permanente](#uc-sup-14--annotation-dune-vidéo-pour-conservation-permanente)
3. [Règles métier transversales](#3-règles-métier-transversales)

---

## 1. Module Opérationnel (Chauffeur)

### UC-OP-01 — Authentification du chauffeur

| Champ            | Valeur      |
| ---------------- | ----------- |
| **Acteur**       | Utilisateur |
| **Priorité**     | Haute       |
| **Précondition** | Aucune      |

**En tant qu'utilisateur, je veux m'authentifier afin que l'application reconnaisse mon identité et me donne accès aux fonctionnalités qui me sont attribuées.**

**Critères d'acceptation :**

- L'utilisateur saisit ses identifiants (login / mot de passe ou SSO).
- En cas d'échec, un message d'erreur explicite est affiché sans révéler si c'est l'identifiant ou le mot de passe qui est incorrect.
- La session est maintenue de manière sécurisée et expire après une période d'inactivité configurable.
- Les droits d'accès sont vérifiés à la connexion et délimitent les fonctionnalités accessibles selon le rôle (chauffeur / administrateur).

---

### UC-OP-02 — Démarrage du service et affichage de l'itinéraire

| Champ            | Valeur                          |
| ---------------- | ------------------------------- |
| **Acteur**       | Chauffeur                       |
| **Priorité**     | Haute                           |
| **Précondition** | Authentifié · commande affectée |

**En tant que chauffeur, je veux démarrer mon service afin que l'application affiche mon itinéraire et me permette de réaliser ma mission.**

**Critères d'acceptation :**

- Au démarrage, l'itinéraire prévu s'affiche sur une carte avec navigation turn-by-turn.
- Les étapes clés (collecte, livraison, pauses) sont identifiées visuellement.
- L'itinéraire se met à jour en temps réel en cas de modification par l'administrateur (→ UC-SUP-05).
- Le démarrage n'est possible qu'à compter de l'heure prévue, avec une tolérance configurable.

---

### UC-OP-03 — Activation de la dashcam

| Champ            | Valeur                     |
| ---------------- | -------------------------- |
| **Acteur**       | Chauffeur                  |
| **Priorité**     | Haute                      |
| **Précondition** | Service démarré (UC-OP-02) |

**En tant que chauffeur, je veux activer la dashcam afin que le flux vidéo soit enregistré en continu sur le serveur distant et puisse être consulté en cas de litige.**

**Critères d'acceptation :**

- L'activation démarre automatiquement avec le service ou manuellement via un bouton dédié.
- Le flux est transmis et enregistré sur le serveur distant en temps réel.
- Le chauffeur est informé en permanence de l'état de la connexion (enregistrement actif / interrompu).
- En cas de perte réseau, les données sont tamponnées localement puis synchronisées dès la reconnexion.

---

### UC-OP-04 — Réception d'une alerte d'incident

| Champ            | Valeur          |
| ---------------- | --------------- |
| **Acteur**       | Chauffeur       |
| **Priorité**     | Haute           |
| **Précondition** | Service démarré |

**En tant que chauffeur, je veux être alerté en temps réel de tout incident sur mon parcours afin de pouvoir adapter ma conduite ou accepter un itinéraire de contournement.**

**Critères d'acceptation :**

- Une notification push (sonore et visuelle) est envoyée dès qu'un incident est détecté sur le trajet.
- L'alerte précise la nature (trafic, accident, travaux) et la localisation de l'incident.
- Si un itinéraire alternatif est disponible, il est proposé — le chauffeur peut l'accepter ou le refuser.
- L'acceptation met à jour la navigation en cours immédiatement.

---

### UC-OP-05 — Signalement d'un incident

| Champ            | Valeur          |
| ---------------- | --------------- |
| **Acteur**       | Chauffeur       |
| **Priorité**     | Haute           |
| **Précondition** | Service démarré |

**En tant que chauffeur, je veux signaler un incident sur mon parcours afin d'alerter la supervision et lui permettre d'adapter la gestion de la commande.**

**Types d'incidents déclarables :**

| Code   | Libellé                        | Description                                                                               |
| ------ | ------------------------------ | ----------------------------------------------------------------------------------------- |
| INC-01 | Ralentissement / Embouteillage | Trafic fortement perturbé entraînant un retard significatif                               |
| INC-02 | Panne grave du véhicule        | Immobilisation complète du véhicule, intervention extérieure requise                      |
| INC-03 | Maintenance impérative         | Action urgente (plein de carburant, gonflage des pneus) nécessitant un arrêt non planifié |

**Critères d'acceptation :**

- Le chauffeur sélectionne le type d'incident dans une liste prédéfinie et peut ajouter un commentaire libre.
- Le signalement est horodaté et géolocalisé automatiquement.
- La supervision reçoit une notification immédiate (→ UC-SUP-10).
- Le chauffeur reçoit un accusé de réception confirmant la prise en compte.

---

## 2. Module Supervision (Administrateur)

### UC-SUP-01 — Authentification de l'administrateur

| Champ            | Valeur         |
| ---------------- | -------------- |
| **Acteur**       | Administrateur |
| **Priorité**     | Haute          |
| **Précondition** | Aucune         |

**En tant qu'utilisateur, je veux m'authentifier afin que l'application reconnaisse mon identité et me donne accès aux fonctionnalités d'administration.**

**Critères d'acceptation :**

- Identiques à UC-OP-01.
- Le profil administrateur dispose de permissions étendues donnant accès aux deux modules (opérationnel et supervision).

---

### UC-SUP-02 — Visualisation de la flotte sur carte interactive

| Champ            | Valeur                          |
| ---------------- | ------------------------------- |
| **Acteur**       | Administrateur                  |
| **Priorité**     | Haute                           |
| **Précondition** | Au moins un véhicule en service |

**En tant qu'administrateur, je veux visualiser en temps réel sur une carte interactive l'ensemble des véhicules déployés et leurs itinéraires afin d'avoir une vision globale des opérations.**

**Critères d'acceptation :**

- Chaque véhicule en service est représenté par un marqueur mis à jour en temps réel (GPS).
- L'itinéraire prévu et le trajet parcouru sont affichés distinctement.
- Un clic sur un véhicule affiche sa fiche détaillée (chauffeur, commande, statut, heure estimée d'arrivée).
- Des filtres sont disponibles : statut, chauffeur, zone géographique.

---

### UC-SUP-03 — Alerte sur incidents routiers à venir

| Champ            | Valeur         |
| ---------------- | -------------- |
| **Acteur**       | Administrateur |
| **Priorité**     | Haute          |
| **Précondition** | Aucune         |

**En tant qu'administrateur, je veux être alerté des incidents routiers susceptibles d'affecter les itinéraires en cours ou planifiés afin d'anticiper les surcoûts et prendre des mesures préventives.**

**Critères d'acceptation :**

- L'application surveille en continu les sources trafic (API temps réel, événements sportifs, travaux programmés).
- Une alerte est générée dès qu'un incident est identifié sur l'itinéraire d'un chauffeur actif ou planifié.
- L'alerte précise les véhicules concernés, l'impact estimé (retard, surcoût) et les actions disponibles.

---

### UC-SUP-04 — Suggestion et validation d'un itinéraire alternatif

| Champ            | Valeur                                                                   |
| ---------------- | ------------------------------------------------------------------------ |
| **Acteur**       | Administrateur                                                           |
| **Priorité**     | Haute                                                                    |
| **Précondition** | Incident détecté sur l'itinéraire d'un chauffeur (UC-SUP-03 ou UC-OP-05) |

**En tant qu'administrateur, je veux recevoir une suggestion d'itinéraire ou de chauffeur de remplacement afin de résoudre efficacement les perturbations en cours.**

**Scénario principal :**

1. L'application détecte un incident et génère une ou plusieurs suggestions.
2. L'administrateur examine les suggestions et valide la plus adaptée.
3. L'acceptation met à jour automatiquement l'itinéraire du chauffeur concerné (→ UC-OP-04).

**Scénarios alternatifs :**

| Situation                                                 | Comportement attendu                                                                                                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Un autre chauffeur disponible peut reprendre la livraison | L'application propose le transfert de la commande avec un nouvel itinéraire calculé ; l'acceptation notifie le chauffeur concerné (→ UC-OP-04). |
| Aucun chauffeur interne disponible                        | L'application suggère un prestataire logistique externe et fournit les informations nécessaires à la prise de contact.                          |

**Critères d'acceptation :**

- La mise à jour de l'itinéraire est notifiée au chauffeur en temps réel.
- Toute décision (acceptation, refus, modification) est tracée dans l'historique de la commande.

---

### UC-SUP-05 — Dessin manuel d'un itinéraire

| Champ            | Valeur                                       |
| ---------------- | -------------------------------------------- |
| **Acteur**       | Administrateur                               |
| **Priorité**     | Moyenne                                      |
| **Précondition** | Commande existante avec un chauffeur affecté |

**En tant qu'administrateur, je veux tracer manuellement l'itinéraire d'un chauffeur sur la carte afin d'adapter son parcours à des contraintes non gérées automatiquement.**

**Critères d'acceptation :**

- L'administrateur peut ajouter, déplacer et supprimer des points de passage sur la carte.
- L'itinéraire est recalculé en tenant compte des points de passage définis.
- Une estimation mise à jour (durée, distance) est affichée avant validation.
- La validation envoie le nouvel itinéraire au chauffeur (→ UC-OP-04).

---

### UC-SUP-06 — Estimation du coût d'un parcours

| Champ            | Valeur         |
| ---------------- | -------------- |
| **Acteur**       | Administrateur |
| **Priorité**     | Moyenne        |
| **Précondition** | Aucune         |

**En tant qu'administrateur, je veux obtenir une estimation du coût d'un parcours intégrant les perturbations prévisibles afin de proposer un tarif précis au client.**

**Critères d'acceptation :**

- L'estimation prend en compte : distance, durée, carburant, péages et surcoût lié aux événements prévisibles (événements sportifs, travaux, conditions météorologiques).
- Le calcul peut être lancé à la demande ou automatiquement à la création d'une commande.
- Le résultat est exportable ou directement intégré à la fiche commande.

---

### UC-SUP-07 — Gestion des chauffeurs et de leurs compétences

| Champ            | Valeur         |
| ---------------- | -------------- |
| **Acteur**       | Administrateur |
| **Priorité**     | Haute          |
| **Précondition** | Aucune         |

**En tant qu'administrateur, je veux gérer le référentiel des chauffeurs et leurs compétences afin de disposer d'une base fiable pour l'attribution automatique des commandes.**

**Critères d'acceptation :**

- Création, modification et désactivation d'un profil chauffeur (informations personnelles, permis, habilitations, disponibilités).
- Association de compétences ou certifications à chaque chauffeur (matières dangereuses, véhicules spéciaux, régions autorisées).
- Consultation de l'historique des missions par chauffeur.
- Gestion des disponibilités (congés, absences, plages horaires).

---

### UC-SUP-08 — Validation d'une commande et attribution d'un chauffeur

| Champ            | Valeur                                                      |
| ---------------- | ----------------------------------------------------------- |
| **Acteur**       | Administrateur                                              |
| **Priorité**     | Haute                                                       |
| **Précondition** | Au moins un chauffeur actif dans le référentiel (UC-SUP-07) |

**En tant qu'administrateur, je veux valider une commande pour une date donnée afin que l'application attribue automatiquement le chauffeur le plus adapté selon ses disponibilités et ses compétences.**

**Scénario principal :**

1. L'administrateur crée ou reçoit une commande et saisit les paramètres (date, horaire, origine, destination, type de marchandise, compétences requises).
2. L'application sélectionne automatiquement le meilleur chauffeur disponible.
3. La commande est confirmée et le chauffeur notifié.

**Scénarios alternatifs :**

| Situation                                     | Comportement attendu                                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Aucun chauffeur disponible à la date demandée | Une alerte est déclenchée (→ UC-SUP-09) ; l'administrateur peut modifier la date, forcer l'attribution ou contacter un prestataire externe. |
| Plusieurs chauffeurs éligibles                | L'application propose un classement basé sur les compétences, la proximité et la charge de travail.                                         |

**Critères d'acceptation :**

- Le moteur d'attribution est traçable : l'administrateur peut consulter les raisons du choix effectué.
- Une commande non attribuée reste en statut « En attente » et génère une alerte persistante (→ UC-SUP-09).

---

### UC-SUP-09 — Alerte : aucun chauffeur attribué à une commande

| Champ             | Valeur                                      |
| ----------------- | ------------------------------------------- |
| **Acteur**        | Administrateur                              |
| **Priorité**      | Haute                                       |
| **Déclenché par** | UC-SUP-08 (échec d'attribution automatique) |

**En tant qu'administrateur, je veux être alerté dès qu'aucun chauffeur ne peut être attribué à une commande afin de prendre rapidement une décision corrective.**

**Critères d'acceptation :**

- L'alerte est envoyée immédiatement (notification in-app + e-mail) avec les détails de la commande et la date concernée.
- Depuis l'alerte, l'administrateur peut : modifier la date, forcer une attribution manuelle ou déclencher une recherche de prestataire externe.
- L'alerte reste active tant que la commande est en statut « Non attribuée ».

---

### UC-SUP-10 — Consultation des signalements des chauffeurs

| Champ            | Valeur         |
| ---------------- | -------------- |
| **Acteur**       | Administrateur |
| **Priorité**     | Haute          |
| **Alimenté par** | UC-OP-05       |

**En tant qu'administrateur, je veux consulter l'ensemble des signalements émis par les chauffeurs afin d'en prendre connaissance et d'y apporter une réponse adaptée.**

**Critères d'acceptation :**

- Les signalements sont listés avec : date, heure, chauffeur, type d'incident, localisation et commentaire.
- Des filtres permettent de trier par statut (non traité / en cours / résolu), type d'incident et chauffeur.
- L'administrateur peut changer le statut d'un signalement et y ajouter une note de suivi.
- Les signalements résolus sont archivés et consultables dans l'historique.

---

### UC-SUP-11 — Visualisation des commandes via un agenda

| Champ            | Valeur         |
| ---------------- | -------------- |
| **Acteur**       | Administrateur |
| **Priorité**     | Haute          |
| **Précondition** | Aucune         |

**En tant qu'administrateur, je veux visualiser toutes les commandes dans une vue agenda afin d'avoir une vision temporelle claire de l'ensemble des missions planifiées.**

**Critères d'acceptation :**

- L'agenda propose des vues : jour, semaine, mois.
- Chaque commande est affichée avec son statut (planifiée, en cours, livrée, annulée) et le chauffeur affecté.
- Un clic sur une commande ouvre sa fiche détaillée.
- Des filtres permettent d'afficher par chauffeur, statut ou zone géographique.

---

### UC-SUP-12 — Lecture des enregistrements dashcam

| Champ            | Valeur                         |
| ---------------- | ------------------------------ |
| **Acteur**       | Administrateur                 |
| **Priorité**     | Haute                          |
| **Précondition** | Vidéos enregistrées (UC-OP-03) |

**En tant qu'administrateur, je veux accéder aux enregistrements dashcam des missions terminées afin de les visionner en cas de litige ou d'audit.**

**Critères d'acceptation :**

- Les vidéos sont accessibles depuis la fiche de chaque commande.
- Un lecteur intégré permet lecture, pause et navigation par horodatage.
- L'accès est réservé aux profils autorisés (administrateur, responsable qualité).
- Un journal d'accès (qui a consulté, quand) est conservé pour chaque vidéo.

---

### UC-SUP-13 — Politique de suppression automatique des vidéos

| Champ            | Valeur         |
| ---------------- | -------------- |
| **Acteur**       | Administrateur |
| **Priorité**     | Moyenne        |
| **Précondition** | Aucune         |

**En tant qu'administrateur, je veux configurer une politique de suppression automatique des enregistrements dashcam afin de maîtriser l'espace de stockage disponible sur le serveur.**

**Critères d'acceptation :**

- L'administrateur définit une durée de rétention par défaut (ex. 30 / 60 / 90 jours après la fin de la mission).
- Les vidéos dont la durée de rétention est expirée sont supprimées automatiquement, sauf si elles sont annotées (→ UC-SUP-14).
- Un rapport de suppression est généré et archivé à chaque exécution du processus.
- Un changement de politique s'applique aux nouvelles vidéos uniquement, sauf configuration explicite contraire.

---

### UC-SUP-14 — Annotation d'une vidéo pour conservation permanente

| Champ            | Valeur                       |
| ---------------- | ---------------------------- |
| **Acteur**       | Administrateur               |
| **Priorité**     | Moyenne                      |
| **Précondition** | Vidéo accessible (UC-SUP-12) |

**En tant qu'administrateur, je veux annoter une vidéo afin de la protéger de la suppression automatique et de conserver les enregistrements présentant un intérêt particulier.**

**Critères d'acceptation :**

- L'administrateur peut apposer une annotation textuelle sur une vidéo (motif de conservation, référence dossier).
- Une vidéo annotée est exclue de la suppression automatique (→ UC-SUP-13) tant que l'annotation n'est pas retirée par un utilisateur autorisé.
- Le statut « Conservée » est clairement visible dans la liste des vidéos.
- Toute modification ou suppression d'annotation est tracée (auteur, date).

---

## 3. Règles métier transversales

| Référence | Règle                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RMT-01    | Toute action critique (validation de commande, modification d'itinéraire, suppression de vidéo) est tracée avec l'identité de l'auteur et l'horodatage. |
| RMT-02    | Un chauffeur n'accède qu'au module opérationnel ; un administrateur accède aux deux modules.                                                            |
| RMT-03    | Les données GPS et vidéo sont chiffrées en transit (TLS) et au repos.                                                                                   |
| RMT-04    | Les notifications critiques (incidents, alertes trafic) doivent être délivrées en moins de 30 secondes après détection.                                 |
| RMT-05    | En cas d'indisponibilité réseau, les données locales (position GPS, signalements) sont synchronisées dès le rétablissement de la connexion.             |
