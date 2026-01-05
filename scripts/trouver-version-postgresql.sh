#!/bin/bash

# Script pour trouver la version et le chemin de PostgreSQL

echo "🔍 Recherche de PostgreSQL..."

# Méthode 1 : Vérifier la version installée
echo ""
echo "Version PostgreSQL :"
psql --version

# Méthode 2 : Trouver le dossier de configuration
echo ""
echo "Dossiers PostgreSQL trouvés :"
ls -la /etc/postgresql/ 2>/dev/null || echo "Aucun dossier trouvé dans /etc/postgresql/"

# Méthode 3 : Trouver le fichier pg_hba.conf
echo ""
echo "Fichier pg_hba.conf trouvé :"
find /etc -name "pg_hba.conf" 2>/dev/null || echo "Aucun fichier pg_hba.conf trouvé"

# Méthode 4 : Vérifier si PostgreSQL est installé
echo ""
echo "Service PostgreSQL :"
systemctl status postgresql --no-pager -l | head -5 || echo "Service PostgreSQL non trouvé"

