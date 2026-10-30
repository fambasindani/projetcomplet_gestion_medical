#!/bin/bash
# ============================================================
# Déploiement du frontend Next.js (Hôpital - module médical)
# Usage : bash deploy.sh [serveur] [chemin_distant]
# Exemple : bash deploy.sh user@mon-serveur.com /var/www/medical
# ============================================================

set -e

# -------- Paramètres --------
SERVEUR="${1:-user@mon-serveur.com}"      # ssh user@ip ou nom de domaine
DEST="${2:-/var/www/medical}"             # dossier cible sur le serveur
PORT_API="${PORT_API:-http://localhost:7035/api}"  # URL du backend

# -------- 1. Build --------
echo ">>> Construction du frontend..."
cd "$(dirname "$0")/frontend"
npm ci
NEXT_PUBLIC_API_URL="$PORT_API" npm run build

# -------- 2. Préparation du dossier de déploiement --------
echo ">>> Préparation du dossier dist_deploy..."
TMP="dist_deploy"
rm -rf "$TMP"
mkdir -p "$TMP/.next"

# Le serveur autonome (server.js + node_modules + package.json)
cp -r .next/standalone/* "$TMP/"

# Les assets statiques (JS/CSS) — OBLIGATOIRE sinon page blanche
cp -r .next/static "$TMP/.next/static"

# Les fichiers publics (images, favicon...)
cp -r public "$TMP/public"

# Fichier d'environnement (URL de l'API)
echo "NEXT_PUBLIC_API_URL=$PORT_API" > "$TMP/.env"

# -------- 3. Envoi vers le serveur --------
echo ">>> Envoi vers $SERVEUR:$DEST ..."
ssh "$SERVEUR" "mkdir -p $DEST"
rsync -avz --delete "$TMP/" "$SERVEUR:$DEST/"

# -------- 4. (Re)démarrage via PM2 --------
echo ">>> Redémarrage du processus Node (PM2)..."
ssh "$SERVEUR" "cd $DEST && (pm2 restart hopital-frontend || pm2 start server.js --name hopital-frontend) && pm2 save"

rm -rf "$TMP"
echo ">>> Déploiement terminé ✅  Frontend sur http://$SERVEUR:3000/medical"
