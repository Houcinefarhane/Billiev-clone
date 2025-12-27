# Sécurité des Données

## Principe Fondamental

**Toutes les données sensibles doivent être stockées uniquement sur Supabase et dans le fichier `.env` local. Aucune donnée réelle ne doit être visible sur GitHub.**

## Fichiers Protégés

Le fichier `.gitignore` protège automatiquement :
- Tous les fichiers `.env*` (sauf `.env.example`)
- Les bases de données locales (`.db`)
- Les fichiers de configuration avec secrets
- Les logs
- Les backups

## Configuration

1. **Ne jamais** commiter le fichier `.env` avec de vraies valeurs
2. **Toujours** utiliser des variables d'environnement pour les données sensibles
3. **Vérifier** avant chaque commit qu'aucune donnée réelle n'est dans le code

## Variables d'Environnement Requises

Toutes ces variables doivent être dans `.env` (jamais dans le code) :

- `DATABASE_URL` - URL de connexion Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - URL publique Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service Supabase
- `NEXTAUTH_SECRET` - Secret pour l'authentification
- `RESEND_API_KEY` - Clé API Resend
- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret webhook Stripe

## Vérification Avant Commit

Avant de commiter, vérifier :
```bash
# Chercher des URLs de base de données
git diff | grep -i "postgresql://"

# Chercher des clés API
git diff | grep -E "sk_|pk_|whsec_|re_[a-zA-Z0-9]{20,}"

# Chercher des emails réels
git diff | grep -E "@[a-zA-Z0-9]+\.[a-zA-Z]{2,}"
```

## En Cas d'Erreur

Si vous avez accidentellement commité des données sensibles :
1. Ne pas paniquer
2. Changer immédiatement les credentials compromis sur Supabase/Stripe/Resend
3. Utiliser `git filter-branch` ou `git filter-repo` pour nettoyer l'historique (avancé)

