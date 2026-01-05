#!/bin/bash

# Script pour exporter les tables Supabase vers une base PostgreSQL locale
# Usage: ./scripts/export-supabase-to-local.sh

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Export Supabase vers PostgreSQL local${NC}"
echo ""

# Vérifier si les variables d'environnement sont définies
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  Variable SUPABASE_DB_URL non définie${NC}"
    echo "Format attendu: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
    echo ""
    read -p "Entrez l'URL de connexion Supabase: " SUPABASE_DB_URL
fi

if [ -z "$LOCAL_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  Variable LOCAL_DB_URL non définie${NC}"
    echo "Format attendu: postgresql://user:password@localhost:5432/dbname"
    echo ""
    read -p "Entrez l'URL de connexion PostgreSQL locale: " LOCAL_DB_URL
fi

# Nom du fichier de dump
DUMP_FILE="supabase_dump_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${BLUE}📤 Export des données depuis Supabase...${NC}"
echo "Fichier de dump: $DUMP_FILE"
echo ""

# Exporter avec pg_dump
# Options:
# -Fc: Format custom (compressé, plus rapide)
# --no-owner: Ne pas inclure les propriétaires
# --no-acl: Ne pas inclure les permissions
# --schema-only: Structure uniquement (décommentez si besoin)
# --data-only: Données uniquement (décommentez si besoin)

pg_dump "$SUPABASE_DB_URL" \
    --format=custom \
    --no-owner \
    --no-acl \
    --verbose \
    -f "$DUMP_FILE"

echo ""
echo -e "${GREEN}✅ Export terminé: $DUMP_FILE${NC}"
echo ""

# Demander si on veut restaurer immédiatement
read -p "Voulez-vous restaurer sur la base locale maintenant? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${BLUE}📥 Restauration sur la base locale...${NC}"
    
    # Restaurer avec pg_restore
    pg_restore \
        --dbname="$LOCAL_DB_URL" \
        --no-owner \
        --no-acl \
        --verbose \
        --clean \
        --if-exists \
        "$DUMP_FILE"
    
    echo ""
    echo -e "${GREEN}✅ Restauration terminée!${NC}"
fi

echo ""
echo -e "${BLUE}💡 Pour restaurer plus tard:${NC}"
echo "pg_restore --dbname=\"\$LOCAL_DB_URL\" --no-owner --no-acl --clean --if-exists $DUMP_FILE"
echo ""

