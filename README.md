# HERMAN FASHION — Site web officiel

Plateforme Full Stack du **CFP HERMAN FASHION** (formation aux métiers de la beauté et du bien-être, Douala) :
vitrine institutionnelle, catalogue des formations, inscription en ligne, espace apprenant, validation des paiements
en espèces par l'administration, messagerie service client et assistant intelligent **HERMAN AI**.

## Stack

| Couche | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) · React 19 · TypeScript |
| Design | Tailwind CSS 4 · Cormorant Garamond + Manrope · palette orange / blanc / noir |
| Base de données | PostgreSQL via Drizzle ORM (PGlite embarqué si `DATABASE_URL` est vide) |
| Authentification | Sessions JWT signées (cookie httpOnly) · mots de passe bcrypt · rôles apprenant / admin |
| IA | API Anthropic (Claude) alimentée par la base de connaissances du site |
| Médias | Vercel Blob (si configuré) ou dossier `public/uploads` |

## Démarrage local

```bash
npm install
cp .env.example .env.local   # facultatif en local
npm run dev                  # http://localhost:3000
```

Au premier lancement, la base est créée et initialisée automatiquement (tarifs, 9 formations, 2 centres, FAQ, galerie).
Administrateur par défaut : `admin@hermanfashion.cm` / `HermanFashion@2026` → **à changer immédiatement** via `ADMIN_PASSWORD`
(défini *avant* le premier démarrage) ou en créant un autre administrateur puis en retirant les droits du compte par défaut.

## Mise en ligne recommandée : Vercel + Neon (≈ 15 minutes)

1. Créez une base PostgreSQL gratuite sur **neon.tech** et copiez la chaîne de connexion.
2. Poussez ce dossier sur GitHub, puis importez le dépôt sur **vercel.com**.
3. Dans *Settings → Environment Variables*, renseignez : `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `NEXT_PUBLIC_SITE_URL`, et éventuellement `ANTHROPIC_API_KEY`.
4. Dans *Storage*, créez un **Blob store** et liez-le au projet (ajoute `BLOB_READ_WRITE_TOKEN`) pour les envois de photos.
5. Déployez. Les tables sont créées et remplies au premier démarrage.
6. Branchez votre nom de domaine dans *Settings → Domains*.

## Hébergement sur serveur (VPS)

```bash
npm ci && npm run build
AUTH_SECRET=... ADMIN_PASSWORD=... npm start   # idéalement avec PM2 derrière Nginx (HTTPS)
```
Sans `DATABASE_URL`, les données sont stockées dans `.data/pglite` (à sauvegarder régulièrement).

## Premiers réglages dans l'administration (`/admin`)

1. **Contenus & coordonnées** : téléphone, WhatsApp (active le bouton flottant), e-mail, horaires, conditions d'admission,
   histoire et équipe (ces sections restent masquées tant qu'elles sont vides).
2. **Formations** : cocher pour chaque spécialité les durées confirmées par la direction, compléter objectifs, compétences
   et contenu (un élément par ligne), remplacer les photos si souhaité.
3. **Références administratives** : vérifier le numéro d'arrêté pré-rempli (relevé sur la banderole de l'établissement).
4. **Photos & vidéos** : ajouter les vidéos de présentation, d'immersion et de témoignages (fichier ou lien YouTube/Facebook/TikTok).
5. **Témoignages** : uniquement des témoignages authentiques ; la section apparaît dès le premier témoignage publié.

## Parcours d'inscription et de paiement (V1)

Candidat : crée son compte → choisit formation + durée → consulte le récapitulatif → soumet sa demande (référence `HF-AAAA-XXXX`)
→ règle en espèces auprès de la direction.
Administration : *Inscriptions & paiements* → ouvre le dossier → **Confirmer le paiement** (montant, tranche, date, n° de reçu).
Le statut se met à jour automatiquement (en attente → paiement partiel → paiement confirmé) et l'apprenant est notifié.
La direction **valide** ensuite l'inscription. Un paiement saisi par erreur peut être supprimé (montants recalculés).

## Architecture

```
src/
  app/(site)/        pages publiques + espace apprenant (/espace)
  app/admin/         tableau de bord administrateur
  app/actions/       Server Actions (auth, apprenant, admin) — toutes les autorisations sont vérifiées côté serveur
  app/api/assistant  API de HERMAN AI (connexion obligatoire, limite horaire)
  db/                schéma Drizzle, connexion, données initiales
  lib/               auth, accès aux données, logique d'inscription, IA, stockage
  components/        interface (header, cartes, formulaires, HERMAN AI…)
drizzle/             migrations SQL
```

### Évolutions prévues (déjà anticipées dans le code)

- **Mobile Money / carte** : table `payments.method` (`orange_money`, `mtn_momo`, `carte`) — brancher un fournisseur
  (CinetPay, NotchPay…) qui appellera `recomputeEnrollment` après confirmation.
- **Parrainage** : colonnes `users.referralCode` et `users.referredById` déjà présentes ; le mode de paiement choisi
  (unique / tranches) est enregistré sur chaque inscription pour le calcul futur des commissions.
- Attestations numériques, suivi pédagogique, espace formateur : nouveaux rôles sur `users.role`.

## Commandes utiles

```bash
npm run dev            # développement
npm run build          # build de production
npm run start          # serveur de production
npx drizzle-kit generate --name <nom>   # nouvelle migration après modification de src/db/schema.ts
```
