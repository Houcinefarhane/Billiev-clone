#!/bin/bash

# Script pour configurer le nouveau repository GitHub 'clone-billiev'

echo "🔗 Configuration du repository GitHub 'clone-billiev'..."
echo ""

# Vérifier si le remote existe déjà
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' existe déjà"
    git remote -v
    read -p "Voulez-vous le remplacer? (o/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        git remote remove origin
    else
        echo "❌ Annulé"
        exit 1
    fi
fi

# Ajouter le nouveau remote
echo "📤 Ajout du remote GitHub..."
git remote add origin git@github.com:Houcinefarhane/clone-billiev.git

# Vérifier
echo ""
echo "✅ Remote configuré :"
git remote -v

echo ""
echo "📋 Prochaines étapes :"
echo "   1. Créer le repository sur GitHub : https://github.com/new"
echo "   2. Nom : 'clone-billiev'"
echo "   3. Puis exécutez : git push -u origin main"

