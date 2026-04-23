# TrackTruck — Spécification des Use Cases

> **Version :** 1.3 · **Date :** Avril 2026 · **Statut :** En cours de révision

---

## Table des matières

1. [Module Opérationnel (Chauffeur)](#1-module-opérationnel-chauffeur)
   - [UC-OP-01 — Authentification du chauffeur](#uc-op-01--authentification-du-chauffeur)
   - [UC-OP-02 — Démarrage du service et affichage de l'itinéraire](#uc-op-02--démarrage-du-service-et-affichage-de-litinéraire)
   - [UC-OP-03 — Activation de la dashcam](#uc-op-03--activation-de-la-dashcam)
   - [UC-OP-04 — Réception d'une alerte d'incident](#uc-op-04--réception-dune-alerte-dincident)
   - [UC-OP-05 — Signalement d'un incident](#uc-op-05--signalement-dun-incident)
   - [UC-OP-06 — Proposition de pauses réglementaires sur l'itinéraire](#uc-op-06--proposition-de-pauses-réglementaires-sur-litinéraire)
   - [UC-OP-07 — Consultation de l'enregistrement dashcam en cas d'accident](#uc-op-07--consultation-de-lenregistrement-dashcam-en-cas-daccident)
2. [Module Supervision (Administrateur)](#2-module-supervision-administrateur)
   - [UC-SUP-01 — Authentification de l'administrateur](#uc-sup-01--authentification-de-ladministrateur)
   - [UC-SUP-02 — Visualisation de la flotte sur carte interactive](#uc-sup-02--visualisation-de-la-flotte-sur-carte-interactive)
   - [UC-SUP-03 — Alerte sur incidents routiers à venir](#uc-sup-03--alerte-sur-incidents-routiers-à-venir)
   - [UC-SUP-04 — Suggestion et validation d'un itinéraire alternatif](#uc-sup-04--suggestion-et-validation-dun-itinéraire-alternatif)
   - [UC-SUP-05 — Dessin manuel d'un itinéraire](#uc-sup-05--dessin-manuel-dun-itinéraire)
   - [UC-SUP-06 — Calcul automatique d'un itinéraire optimisé](#uc-sup-06--calcul-automatique-dun-itinéraire-optimisé)
   - [UC-SUP-07 — Traitement d'un signalement chauffeur : replanification ou annulation](#uc-sup-07--traitement-dun-signalement-chauffeur--replanification-ou-annulation)
   - [UC-SUP-08 — Estimation du coût d'un parcours](#uc-sup-08--estimation-du-coût-dun-parcours)
   - [UC-SUP-09 — Gestion des chauffeurs et de leurs compétences](#uc-sup-09--gestion-des-chauffeurs-et-de-leurs-compétences)
   - [UC-SUP-10 — Validation d'une commande et attribution d'un chauffeur](#uc-sup-10--validation-dune-commande-et-attribution-dun-chauffeur)
   - [UC-SUP-11 — Alerte : aucun chauffeur attribué à une commande](#uc-sup-11--alerte--aucun-chauffeur-attribué-à-une-commande)
   - [UC-SUP-12 — Consultation des signalements des chauffeurs](#uc-sup-12--consultation-des-signalements-des-chauffeurs)
   - [UC-SUP-13 — Visualisation des commandes via un agenda](#uc-sup-13--visualisation-des-commandes-via-un-agenda)
   - [UC-SUP-14 — Lecture des enregistrements dashcam](#uc-sup-14--lecture-des-enregistrements-dashcam)
   - [UC-SUP-15 — Politique de suppression automatique des vidéos](#uc-sup-15--politique-de-suppression-automatique-des-vidéos)
   - [UC-SUP-16 — Annotation d'une vidéo pour conservation permanente](#uc-sup-16--annotation-dune-vidéo-pour-conservation-permanente)
3. [Règles métier transversales](#3-règles-métier-transversales)

---

## 1. Module Opérationnel (Chauffeur)

### UC-OP-01 — Authentification du chauffeur

| Champ | Valeur |
|---|---|
| **Acteur** | Utilisateur |
| **Priorité** | Haute |
| **Précondition** | Aucune |

**En tant qu'utilisateur, je veux m'authentifier afin que l'application reconnaisse mon identité et me donne accès aux fonctionnalités qui me sont attribuées.**

**Critères d'acceptation :**
- L'utilisateur saisit ses identifiants (login / mot de passe ou SSO).
- En cas d'échec, un message d'erreur explicite est affiché sans révéler si c'est l'identifiant ou le mot de passe qui est incorrect.
- La session est maintenue de manière sécurisée et expire après une période d'inactivité configurable.
- Les droits d'accès sont vérifiés à la connexion et délimitent les fonctionnalités accessibles selon le rôle (chauffeur / administrateur).

---

### UC-OP-02 — Démarrage du service et affichage de l'itinéraire

| Champ | Valeur |
|---|---|
| **Acteur** | Chauffeur |
| **Priorité** | Haute |
| **Précondition** | Authentifié · commande affectée |

**En tant que chauffeur, je veux démarrer mon service afin que l'application affiche mon itinéraire et me permette de réaliser ma mission.**

**Critères d'acceptation :**
- Au démarrage, l'itinéraire prévu s'affiche sur une carte avec navigation turn-by-turn.
- Les étapes clés (collecte, livraison, pauses) sont identifiées visuellement.
- L'itinéraire se met à jour en temps réel en cas de modification par l'administrateur (→ UC-SUP-05).
- Le démarrage n'est possible qu'à compter de l'heure prévue, avec une tolérance configurable.

---

### UC-OP-03 — Activation de la dashcam

| Champ | Valeur |
|---|---|
| **Acteur** | Chauffeur |
| **Priorité** | Haute |
| **Précondition** | Service démarré (UC-OP-02) |

**En tant que chauffeur, je veux activer la dashcam afin que le flux vidéo soit enregistré en continu sur le serveur distant et puisse être consulté en cas de litige.**

**Critères d'acceptation :**
- L'activation démarre automatiquement avec le service ou manuellement via un bouton dédié.
- Le flux est transmis et enregistré sur le serveur distant en temps réel.
- Le chauffeur est informé en permanence de l'état de la connexion (enregistrement actif / interrompu).
- En cas de perte réseau, les données sont tamponnées localement puis synchronisées dès la reconnexion.

---

### UC-OP-04 — Réception d'une alerte d'incident

| Champ | Valeur |
|---|---|
| **Acteur** | Chauffeur |
| **Priorité** | Haute |
| **Précondition** | Service démarré |

**En tant que chauffeur, je veux être alerté en temps réel de tout incident sur mon parcours afin de pouvoir adapter ma conduite ou accepter un itinéraire de contournement.**

**Critères d'acceptation :**
- Une notification push (sonore et visuelle) est envoyée dès qu'un incident est détecté sur le trajet.
- L'alerte précise la nature (trafic, accident, travaux) et la localisation de l'incident.
- Si un itinéraire alternatif est disponible, il est proposé — le chauffeur peut l'accepter ou le refuser.
- L'acceptation met à jour la navigation en cours immédiatement.

---

### UC-OP-05 — Signalement d'un incident

| Champ | Valeur |
|---|---|
| **Acteur** | Chauffeur |
| **Priorité** | Haute |
| **Précondition** | Service démarré |

**En tant que chauffeur, je veux signaler un incident sur mon parcours afin d'alerter la supervision et lui permettre d'adapter la gestion de la commande.**

**Types d'incidents déclarables :**

| Code | Libellé | Description |
|---|---|---|
| INC-01 | Ralentissement / Embouteillage | Trafic fortement perturbé entraînant un retard significatif |
| INC-02 | Panne grave du véhicule | Immobilisation complète du véhicule, intervention extérieure requise |
| INC-03 | Maintenance impérative | Action urgente (plein de carburant, gonflage des pneus) nécessitant un arrêt non planifié |

**Critères d'acceptation :**
- Le chauffeur sélectionne le type d'incident dans une liste prédéfinie et peut ajouter un commentaire libre.
- Le signalement est horodaté et géolocalisé automatiquement.
- La supervision reçoit une notification immédiate (→ UC-SUP-12).
- Le chauffeur reçoit un accusé de réception confirmant la prise en compte.

---

### UC-OP-06 — Proposition de pauses réglementaires sur l'itinéraire

| Champ | Valeur |
|---|---|
| **Acteur** | Chauffeur |
| **Priorité** | Haute |
| **Précondition** | Service démarré (UC-OP-02) · itinéraire d'une durée suffisante pour déclencher une obligation légale de pause |

**En tant que chauffeur, je veux que l'application me propose automatiquement des pauses intégrées à mon itinéraire, de préférence dans des stations-service, afin de respecter la législation en vigueur sur les temps de conduite et de repos.**

**Critères d'acceptation :**
- L'application calcule les pauses obligatoires en fonction de la durée et de la distance du trajet, conformément à la réglementation applicable (ex. directive européenne sur le temps de conduite : pause de 45 min après 4h30 de conduite continue).
- Les pauses sont intégrées à l'itinéraire dès le démarrage du service et repositionnées automatiquement en cas de modification du parcours.
- L'application privilégie les stations-service comme point d'arrêt ; à défaut, elle propose toute aire de repos homologuée à proximité du trajet.
- Le chauffeur est prévenu par une notification à l'approche de chaque pause (distance et temps restants configurables).
- Le chauffeur peut décaler manuellement une pause dans une fenêtre de temps limitée ; tout dépassement de la durée légale de conduite déclenche une alerte.
- Les pauses effectuées sont horodatées et enregistrées dans le journal de bord de la mission.

---

### UC-OP-07 — Consultation de l'enregistrement dashcam en cas d'accident

| Champ | Valeur |
|---|---|
| **Acteur** | Chauffeur |
| **Priorité** | Haute |
| **Précondition** | Service démarré (UC-OP-02) · dashcam active (UC-OP-03) · signalement d'un accident émis (UC-OP-05 — INC-02) |

**En tant que chauffeur, je veux pouvoir consulter les 15 dernières minutes d'enregistrement dashcam immédiatement après un accident afin de disposer rapidement des éléments visuels nécessaires à la déclaration auprès de l'assurance.**

**Critères d'acceptation :**
- Lors d'un signalement de type accident (INC-02), l'application propose automatiquement un accès direct aux 15 dernières minutes d'enregistrement.
- Le chauffeur peut lire la vidéo directement depuis son mobile via un lecteur intégré, avec contrôle de lecture (lecture, pause, navigation par horodatage).
- Le chauffeur peut télécharger le segment vidéo sur son mobile pour le partager avec l'assurance ou les forces de l'ordre.
- Le segment concerné est automatiquement marqué comme protégé dès l'accès du chauffeur, empêchant toute suppression automatique (→ UC-SUP-15).
- L'accès et le téléchargement sont horodatés et tracés dans le journal de la commande, consultable par l'administrateur (→ UC-SUP-14).
- En cas de réseau insuffisant pour le streaming, le téléchargement est mis en file d'attente et déclenché dès que la connexion le permet.

---

## 2. Module Supervision (Administrateur)

### UC-SUP-01 — Authentification de l'administrateur

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Aucune |

**En tant qu'utilisateur, je veux m'authentifier afin que l'application reconnaisse mon identité et me donne accès aux fonctionnalités d'administration.**

**Critères d'acceptation :**
- Identiques à UC-OP-01.
- Le profil administrateur dispose de permissions étendues donnant accès aux deux modules (opérationnel et supervision).

---

### UC-SUP-02 — Visualisation de la flotte sur carte interactive

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Au moins un véhicule en service |

**En tant qu'administrateur, je veux visualiser en temps réel sur une carte interactive l'ensemble des véhicules déployés et leurs itinéraires afin d'avoir une vision globale des opérations.**

**Critères d'acceptation :**
- Chaque véhicule en service est représenté par un marqueur mis à jour en temps réel (GPS).
- L'itinéraire prévu et le trajet parcouru sont affichés distinctement.
- Un clic sur un véhicule affiche sa fiche détaillée (chauffeur, commande, statut, heure estimée d'arrivée).
- Des filtres sont disponibles : statut, chauffeur, zone géographique.

---

### UC-SUP-03 — Alerte sur incidents routiers à venir

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Aucune |

**En tant qu'administrateur, je veux être alerté des incidents routiers susceptibles d'affecter les itinéraires en cours ou planifiés afin d'anticiper les surcoûts et prendre des mesures préventives.**

**Critères d'acceptation :**
- L'application surveille en continu les sources trafic (API temps réel, événements sportifs, travaux programmés).
- Une alerte est générée dès qu'un incident est identifié sur l'itinéraire d'un chauffeur actif ou planifié.
- L'alerte précise les véhicules concernés, l'impact estimé (retard, surcoût) et les actions disponibles.

---

### UC-SUP-04 — Suggestion et validation d'un itinéraire alternatif

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Incident détecté sur l'itinéraire d'un chauffeur (UC-SUP-03 ou UC-OP-05) |

**En tant qu'administrateur, je veux recevoir une suggestion d'itinéraire ou de chauffeur de remplacement afin de résoudre efficacement les perturbations en cours.**

**Scénario principal :**
1. L'application détecte un incident et génère une ou plusieurs suggestions.
2. L'administrateur examine les suggestions et valide la plus adaptée.
3. L'acceptation met à jour automatiquement l'itinéraire du chauffeur concerné (→ UC-OP-04).

**Scénarios alternatifs :**

| Situation | Comportement attendu |
|---|---|
| Un autre chauffeur disponible peut reprendre la livraison | L'application propose le transfert de la commande avec un nouvel itinéraire calculé ; l'acceptation notifie le chauffeur concerné (→ UC-OP-04). |
| Aucun chauffeur interne disponible | L'application suggère un prestataire logistique externe et fournit les informations nécessaires à la prise de contact. |

**Critères d'acceptation :**
- La mise à jour de l'itinéraire est notifiée au chauffeur en temps réel.
- Toute décision (acceptation, refus, modification) est tracée dans l'historique de la commande.

---

### UC-SUP-05 — Dessin manuel d'un itinéraire

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Moyenne |
| **Précondition** | Commande existante avec un chauffeur affecté |

**En tant qu'administrateur, je veux tracer manuellement l'itinéraire d'un chauffeur sur la carte afin d'adapter son parcours à des contraintes non gérées automatiquement.**

**Critères d'acceptation :**
- L'administrateur peut ajouter, déplacer et supprimer des points de passage sur la carte.
- L'itinéraire est recalculé en tenant compte des points de passage définis.
- Une estimation mise à jour (durée, distance) est affichée avant validation.
- La validation envoie le nouvel itinéraire au chauffeur (→ UC-OP-04).

---

### UC-SUP-06 — Calcul automatique d'un itinéraire optimisé

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Commande créée avec une charge de véhicule et un point de livraison renseignés |

**En tant qu'administrateur, je veux que l'application calcule automatiquement l'itinéraire le moins coûteux en tenant compte de la charge du camion et du coût estimé du parcours, afin d'automatiser et d'optimiser la planification des missions.**

**Scénario principal :**
1. Lors de la création ou de la planification d'une commande, l'application déclenche automatiquement le calcul d'itinéraire.
2. L'algorithme prend en compte : la charge déclarée du véhicule, les coûts estimés (carburant, péages, usure), les contraintes réglementaires (gabarit, poids autorisé) et les perturbations trafic prévisibles (→ UC-SUP-08).
3. L'application soumet la proposition à l'administrateur pour validation.
4. L'administrateur valide ou rejette la proposition ; en cas de rejet, il peut déclencher un nouveau calcul ou tracer manuellement l'itinéraire (→ UC-SUP-05).

**Critères d'acceptation :**
- Le calcul est déclenché automatiquement à la création d'une commande et peut être relancé manuellement à tout moment.
- La proposition affiche un récapitulatif : distance totale, durée estimée, coût détaillé (carburant, péages, surcoûts prévisibles) et les contraintes appliquées.
- Aucun itinéraire n'est transmis au chauffeur sans validation explicite de l'administrateur.
- Si plusieurs itinéraires sont équivalents, l'application les présente classés par coût croissant.
- La décision de l'administrateur (validation ou rejet) est tracée dans l'historique de la commande.

---

### UC-SUP-07 — Traitement d'un signalement chauffeur : replanification ou annulation

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Un signalement d'incident a été émis par un chauffeur (UC-OP-05) |
| **Déclenché par** | UC-OP-05 · UC-SUP-12 |

**En tant qu'administrateur, je veux pouvoir prendre une décision opérationnelle suite à un signalement chauffeur — en retraçant l'itinéraire ou en annulant le parcours — afin de gérer efficacement les situations imprévues en cours de mission.**

**Scénario principal — Replanification de l'itinéraire :**
1. L'administrateur reçoit une alerte de signalement (→ UC-SUP-12) et consulte le détail de l'incident.
2. Il choisit de retracer l'itinéraire manuellement (→ UC-SUP-05) ou de déclencher un nouveau calcul automatique (→ UC-SUP-06).
3. Le nouvel itinéraire validé est transmis au chauffeur en temps réel (→ UC-OP-04).

**Scénario alternatif — Annulation du parcours :**

| Situation | Comportement attendu |
|---|---|
| L'administrateur décide d'annuler le parcours (panne grave, incident bloquant) | Le chauffeur reçoit une notification d'annulation et son itinéraire est automatiquement redirigé vers l'entrepôt d'origine. |
| Le chauffeur ne peut pas rejoindre l'entrepôt (ex. panne grave immobilisante) | L'application propose à l'administrateur d'envoyer une assistance ou un véhicule de remplacement. |

**Critères d'acceptation :**
- L'administrateur dispose depuis la fiche de signalement de deux actions directes : « Replanifier » et « Annuler le parcours ».
- En cas d'annulation, l'itinéraire de retour vers l'entrepôt est calculé automatiquement et transmis au chauffeur sans action supplémentaire.
- Le chauffeur est notifié immédiatement de la décision prise (replanification ou annulation) avec les détails du nouvel itinéraire.
- La commande passe en statut « Annulée » et l'événement est tracé dans l'historique avec le motif renseigné par l'administrateur.
- Toute décision est horodatée et associée à l'identité de l'administrateur ayant agi.

---

### UC-SUP-08 — Estimation du coût d'un parcours

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Moyenne |
| **Précondition** | Aucune |

**En tant qu'administrateur, je veux obtenir une estimation du coût d'un parcours intégrant les perturbations prévisibles afin de proposer un tarif précis au client.**

**Critères d'acceptation :**
- L'estimation prend en compte : distance, durée, carburant, péages et surcoût lié aux événements prévisibles (événements sportifs, travaux, conditions météorologiques).
- Le calcul peut être lancé à la demande ou automatiquement à la création d'une commande.
- Le résultat est exportable ou directement intégré à la fiche commande.

---

### UC-SUP-09 — Gestion des chauffeurs et de leurs compétences

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Aucune |

**En tant qu'administrateur, je veux gérer le référentiel des chauffeurs et leurs compétences afin de disposer d'une base fiable pour l'attribution automatique des commandes.**

**Critères d'acceptation :**
- Création, modification et désactivation d'un profil chauffeur (informations personnelles, permis, habilitations, disponibilités).
- Association de compétences ou certifications à chaque chauffeur (matières dangereuses, véhicules spéciaux, régions autorisées).
- Consultation de l'historique des missions par chauffeur.
- Gestion des disponibilités (congés, absences, plages horaires).

---

### UC-SUP-10 — Validation d'une commande et attribution d'un chauffeur

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Au moins un chauffeur actif dans le référentiel (UC-SUP-09) |

**En tant qu'administrateur, je veux valider une commande pour une date donnée afin que l'application attribue automatiquement le chauffeur le plus adapté selon ses disponibilités et ses compétences.**

**Scénario principal :**
1. L'administrateur crée ou reçoit une commande et saisit les paramètres (date, horaire, origine, destination, type de marchandise, compétences requises).
2. L'application sélectionne automatiquement le meilleur chauffeur disponible.
3. La commande est confirmée et le chauffeur notifié.

**Scénarios alternatifs :**

| Situation | Comportement attendu |
|---|---|
| Aucun chauffeur disponible à la date demandée | Une alerte est déclenchée (→ UC-SUP-11) ; l'administrateur peut modifier la date, forcer l'attribution ou contacter un prestataire externe. |
| Plusieurs chauffeurs éligibles | L'application propose un classement basé sur les compétences, la proximité et la charge de travail. |

**Critères d'acceptation :**
- Le moteur d'attribution est traçable : l'administrateur peut consulter les raisons du choix effectué.
- Une commande non attribuée reste en statut « En attente » et génère une alerte persistante (→ UC-SUP-11).

---

### UC-SUP-11 — Alerte : aucun chauffeur attribué à une commande

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Déclenché par** | UC-SUP-10 (échec d'attribution automatique) |

**En tant qu'administrateur, je veux être alerté dès qu'aucun chauffeur ne peut être attribué à une commande afin de prendre rapidement une décision corrective.**

**Critères d'acceptation :**
- L'alerte est envoyée immédiatement (notification in-app + e-mail) avec les détails de la commande et la date concernée.
- Depuis l'alerte, l'administrateur peut : modifier la date, forcer une attribution manuelle ou déclencher une recherche de prestataire externe.
- L'alerte reste active tant que la commande est en statut « Non attribuée ».

---

### UC-SUP-12 — Consultation des signalements des chauffeurs

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Alimenté par** | UC-OP-05 |

**En tant qu'administrateur, je veux consulter l'ensemble des signalements émis par les chauffeurs afin d'en prendre connaissance et d'y apporter une réponse adaptée.**

**Critères d'acceptation :**
- Les signalements sont listés avec : date, heure, chauffeur, type d'incident, localisation et commentaire.
- Des filtres permettent de trier par statut (non traité / en cours / résolu), type d'incident et chauffeur.
- L'administrateur peut changer le statut d'un signalement, y ajouter une note de suivi et déclencher une action corrective (→ UC-SUP-07).
- Les signalements résolus sont archivés et consultables dans l'historique.

---

### UC-SUP-13 — Visualisation des commandes via un agenda

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Aucune |

**En tant qu'administrateur, je veux visualiser toutes les commandes dans une vue agenda afin d'avoir une vision temporelle claire de l'ensemble des missions planifiées.**

**Critères d'acceptation :**
- L'agenda propose des vues : jour, semaine, mois.
- Chaque commande est affichée avec son statut (planifiée, en cours, livrée, annulée) et le chauffeur affecté.
- Un clic sur une commande ouvre sa fiche détaillée.
- Des filtres permettent d'afficher par chauffeur, statut ou zone géographique.

---

### UC-SUP-14 — Lecture des enregistrements dashcam

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Haute |
| **Précondition** | Vidéos enregistrées (UC-OP-03) |

**En tant qu'administrateur, je veux accéder aux enregistrements dashcam des missions terminées afin de les visionner en cas de litige ou d'audit.**

**Critères d'acceptation :**
- Les vidéos sont accessibles depuis la fiche de chaque commande.
- Un lecteur intégré permet lecture, pause et navigation par horodatage.
- L'accès est réservé aux profils autorisés (administrateur, responsable qualité).
- Un journal d'accès (qui a consulté, quand) est conservé pour chaque vidéo.

---

### UC-SUP-15 — Politique de suppression automatique des vidéos

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Moyenne |
| **Précondition** | Aucune |

**En tant qu'administrateur, je veux configurer une politique de suppression automatique des enregistrements dashcam afin de maîtriser l'espace de stockage disponible sur le serveur.**

**Critères d'acceptation :**
- L'administrateur définit une durée de rétention par défaut (ex. 30 / 60 / 90 jours après la fin de la mission).
- Les vidéos dont la durée de rétention est expirée sont supprimées automatiquement, sauf si elles sont annotées (→ UC-SUP-16).
- Un rapport de suppression est généré et archivé à chaque exécution du processus.
- Un changement de politique s'applique aux nouvelles vidéos uniquement, sauf configuration explicite contraire.

---

### UC-SUP-16 — Annotation d'une vidéo pour conservation permanente

| Champ | Valeur |
|---|---|
| **Acteur** | Administrateur |
| **Priorité** | Moyenne |
| **Précondition** | Vidéo accessible (UC-SUP-14) |

**En tant qu'administrateur, je veux annoter une vidéo afin de la protéger de la suppression automatique et de conserver les enregistrements présentant un intérêt particulier.**

**Critères d'acceptation :**
- L'administrateur peut apposer une annotation textuelle sur une vidéo (motif de conservation, référence dossier).
- Une vidéo annotée est exclue de la suppression automatique (→ UC-SUP-15) tant que l'annotation n'est pas retirée par un utilisateur autorisé.
- Le statut « Conservée » est clairement visible dans la liste des vidéos.
- Toute modification ou suppression d'annotation est tracée (auteur, date).

---

## 3. Règles métier transversales

| Référence | Règle |
|---|---|
| RMT-01 | Toute action critique (validation de commande, modification d'itinéraire, suppression de vidéo) est tracée avec l'identité de l'auteur et l'horodatage. |
| RMT-02 | Un chauffeur n'accède qu'au module opérationnel ; un administrateur accède aux deux modules. |
| RMT-03 | Les données GPS et vidéo sont chiffrées en transit (TLS) et au repos. |
| RMT-04 | Les notifications critiques (incidents, alertes trafic) doivent être délivrées en moins de 30 secondes après détection. |
| RMT-05 | En cas d'indisponibilité réseau, les données locales (position GPS, signalements) sont synchronisées dès le rétablissement de la connexion. |
