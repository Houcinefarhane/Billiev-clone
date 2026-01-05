#!/bin/bash

# ============================================
# COMMANDES POUR CLONER SUPABASE SUR RASPBERRY PI
# ============================================
# Copiez-collez ces commandes une par une sur votre Raspberry Pi

# ============================================
# ÉTAPE 1 : Installer PostgreSQL
# ============================================
sudo apt update
sudo apt install -y postgresql postgresql-contrib postgresql-client

# ============================================
# ÉTAPE 2 : Créer la base de données et l'utilisateur
# ============================================
# Se connecter en tant que postgres
sudo -u postgres psql << EOF
-- Créer la base de données
CREATE DATABASE billiev_db;

-- Créer un utilisateur (remplacez 'votre_mot_de_passe' par votre mot de passe)
CREATE USER pi WITH PASSWORD 'votre_mot_de_passe';

-- Donner tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE billiev_db TO pi;

-- Se connecter à la base et donner les privilèges sur le schéma public
\c billiev_db
GRANT ALL ON SCHEMA public TO pi;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pi;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pi;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pi;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pi;

\q
EOF

# ============================================
# ÉTAPE 3 : Configurer PostgreSQL pour accepter les connexions locales
# ============================================
# Éditer le fichier de configuration (remplacez 15 par votre version de PostgreSQL)
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Ajouter cette ligne (ou modifier si elle existe déjà) :
# host    billiev_db    pi    127.0.0.1/32    md5

# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# ============================================
# ÉTAPE 4 : Définir l'URL de connexion Supabase
# ============================================
# Remplacez par votre URL Supabase (format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres)
export SUPABASE_DB_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.[VOTRE_PROJECT_REF].supabase.co:5432/postgres"

# ============================================
# ÉTAPE 5 : Définir l'URL de connexion locale
# ============================================
export LOCAL_DB_URL="postgresql://pi:votre_mot_de_passe@localhost:5432/billiev_db"

# ============================================
# ÉTAPE 6 : Exporter depuis Supabase
# ============================================
# Créer un fichier de dump (format custom compressé)
DUMP_FILE="supabase_backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$SUPABASE_DB_URL" \
    --format=custom \
    --no-owner \
    --no-acl \
    --verbose \
    -f "$DUMP_FILE"

echo "✅ Export terminé : $DUMP_FILE"
echo "Taille du fichier :"
ls -lh "$DUMP_FILE"

# ============================================
# ÉTAPE 7 : Restaurer sur la base locale
# ============================================
pg_restore \
    --dbname="$LOCAL_DB_URL" \
    --no-owner \
    --no-acl \
    --verbose \
    --clean \
    --if-exists \
    "$DUMP_FILE"

echo "✅ Restauration terminée !"

# ============================================
# ÉTAPE 8 : Vérifier les tables
# ============================================
psql "$LOCAL_DB_URL" -c "\dt"
psql "$LOCAL_DB_URL" -c "SELECT COUNT(*) FROM \"Artisan\";"
psql "$LOCAL_DB_URL" -c "SELECT COUNT(*) FROM \"Client\";"
psql "$LOCAL_DB_URL" -c "SELECT COUNT(*) FROM \"Invoice\";"

echo ""
echo "✅ Vérification terminée !"
echo ""
echo "📋 Pour vous connecter à la base de données :"
echo "psql $LOCAL_DB_URL"

