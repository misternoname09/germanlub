#!/usr/bin/env bash
# =============================================================
# 🔄 Script de mise à jour — GermanLub Shop
# Exécuter après chaque modification du code
#
# Usage : sudo ./update.sh
# =============================================================

set -euo pipefail

PROJECT_DIR="/var/www/germanlub"

GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}[✓]${NC} $1"; }

echo "🔄 Mise à jour de GermanLub Shop..."

# Pull les dernières modifications
cd ${PROJECT_DIR}
git pull origin main

# Backend
log "Mise à jour du backend..."
cd ${PROJECT_DIR}/backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate --no-input
python manage.py collectstatic --no-input
systemctl restart germanlub
log "Backend mis à jour ✓"

# Frontend
log "Rebuild du frontend..."
cd ${PROJECT_DIR}/frontend
npm install
npx ng build --configuration=production
log "Frontend mis à jour ✓"

# Permissions
chown -R www-data:www-data ${PROJECT_DIR}/

echo -e "${GREEN}✅ Mise à jour terminée !${NC}"
