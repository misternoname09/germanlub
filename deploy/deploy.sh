#!/usr/bin/env bash
# =============================================================
# 🚀 Script de déploiement — GermanLub Shop
# VPS OVH VPS-1 (Ubuntu 22.04 / 24.04)
#
# Usage :
#   1. Transférer ce dossier sur le VPS
#   2. chmod +x deploy.sh
#   3. sudo ./deploy.sh
#
# IMPORTANT : Modifiez les variables ci-dessous avant d'exécuter !
# =============================================================

set -euo pipefail

# ╔════════════════════════════════════════════╗
# ║  VARIABLES À MODIFIER                     ║
# ╚════════════════════════════════════════════╝
DOMAIN="germanlub.com"
DB_NAME="germanlub_db"
DB_USER="germanlub_user"
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(24))" 2>/dev/null || openssl rand -base64 24)  # Mot de passe fort auto-généré
DJANGO_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))" 2>/dev/null || echo "CHANGEZ_CETTE_CLE_SECRETE_$(date +%s)")
ADMIN_EMAIL="contact@${DOMAIN}"
REPO_URL=""  # ← URL du dépôt Git (optionnel, sinon copier les fichiers manuellement)

PROJECT_DIR="/var/www/germanlub"

# ╔════════════════════════════════════════════╗
# ║  COULEURS                                 ║
# ╚════════════════════════════════════════════╝
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ╔════════════════════════════════════════════╗
# ║  VÉRIFICATIONS                            ║
# ╚════════════════════════════════════════════╝
if [ "$EUID" -ne 0 ]; then
    error "Ce script doit être exécuté en root (sudo ./deploy.sh)"
fi

if [ "$DOMAIN" = "VOTRE_DOMAINE.com" ]; then
    error "Veuillez modifier la variable DOMAIN dans ce script avant de l'exécuter !"
fi

echo ""
echo "══════════════════════════════════════════════"
echo "  🚀 Déploiement GermanLub Shop"
echo "  Domaine : $DOMAIN"
echo "══════════════════════════════════════════════"
echo ""

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 1 : Mise à jour système            ║
# ╚════════════════════════════════════════════╝
log "Mise à jour du système..."
apt update && apt upgrade -y

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 2 : Installation des dépendances   ║
# ╚════════════════════════════════════════════╝
log "Installation de Python, PostgreSQL, Nginx, Certbot..."
apt install -y \
    python3 python3-pip python3-venv python3-dev \
    postgresql postgresql-contrib libpq-dev \
    nginx certbot python3-certbot-nginx \
    git curl ufw

# Node.js 20 (pour build Angular)
log "Installation de Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
log "Node.js $(node --version) installé"

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 3 : PostgreSQL                     ║
# ╚════════════════════════════════════════════╝
log "Configuration de PostgreSQL..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

sudo -u postgres psql -c "ALTER ROLE ${DB_USER} SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE ${DB_USER} SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
log "Base de données '${DB_NAME}' créée ✓"

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 4 : Projet                         ║
# ╚════════════════════════════════════════════╝
log "Préparation du répertoire projet..."
mkdir -p ${PROJECT_DIR}

if [ -n "$REPO_URL" ]; then
    log "Clonage du dépôt Git..."
    if [ -d "${PROJECT_DIR}/.git" ]; then
        cd ${PROJECT_DIR} && git pull origin main
    else
        git clone ${REPO_URL} ${PROJECT_DIR}
    fi
else
    warn "Pas de REPO_URL configuré. Assurez-vous que les fichiers sont dans ${PROJECT_DIR}"
    if [ ! -d "${PROJECT_DIR}/backend" ]; then
        error "Le dossier ${PROJECT_DIR}/backend n'existe pas. Copiez le projet d'abord."
    fi
fi

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 5 : Backend Django                 ║
# ╚════════════════════════════════════════════╝
log "Configuration du backend Django..."
cd ${PROJECT_DIR}/backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt

# Créer le fichier .env de production
cat > .env << EOF
# Généré automatiquement par deploy.sh
SECRET_KEY=${DJANGO_SECRET_KEY}
DEBUG=False
ALLOWED_HOSTS=${DOMAIN},www.${DOMAIN}
CORS_ALLOWED_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}

DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=VOTRE_EMAIL@gmail.com
EMAIL_HOST_PASSWORD=VOTRE_MOT_DE_PASSE_APP
DEFAULT_FROM_EMAIL=GermanLub Shop <contact@${DOMAIN}>
EOF

warn "⚠️  Pensez à modifier EMAIL_HOST_USER et EMAIL_HOST_PASSWORD dans ${PROJECT_DIR}/backend/.env"

# Migrations et collectstatic
python manage.py migrate --no-input
python manage.py collectstatic --no-input

# Créer le répertoire des logs
mkdir -p /var/log/germanlub

log "Backend Django configuré ✓"

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 6 : Frontend Angular               ║
# ╚════════════════════════════════════════════╝
log "Build du frontend Angular..."
cd ${PROJECT_DIR}/frontend

# Mettre à jour l'URL de l'API pour la production
cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiUrl: 'https://${DOMAIN}/api'
};
EOF

npm install
npx ng build --configuration=production

log "Frontend Angular buildé ✓"

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 7 : Gunicorn (service systemd)     ║
# ╚════════════════════════════════════════════╝
log "Installation du service Gunicorn..."
cp ${PROJECT_DIR}/deploy/germanlub.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable germanlub
systemctl start germanlub
log "Gunicorn démarré ✓"

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 8 : Nginx                          ║
# ╚════════════════════════════════════════════╝
log "Configuration de Nginx..."

# Remplacer le placeholder du domaine dans la config Nginx
sed "s/VOTRE_DOMAINE.com/${DOMAIN}/g" ${PROJECT_DIR}/deploy/nginx.conf \
    > /etc/nginx/sites-available/germanlub

ln -sf /etc/nginx/sites-available/germanlub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
log "Nginx configuré ✓"

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 9 : Permissions                    ║
# ╚════════════════════════════════════════════╝
log "Configuration des permissions..."
chown -R www-data:www-data ${PROJECT_DIR}/
chmod -R 755 ${PROJECT_DIR}/backend/media/

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 10 : SSL (Let's Encrypt)           ║
# ╚════════════════════════════════════════════╝
log "Installation du certificat SSL..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} \
    --non-interactive --agree-tos -m ${ADMIN_EMAIL} \
    || warn "⚠️  SSL a échoué. Vérifiez que le DNS pointe vers ce serveur."

systemctl enable certbot.timer
log "SSL configuré ✓"

# ╔════════════════════════════════════════════╗
# ║  ÉTAPE 11 : Firewall                      ║
# ╚════════════════════════════════════════════╝
log "Configuration du firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
log "Firewall configuré ✓"

# ╔════════════════════════════════════════════╗
# ║  TERMINÉ !                                ║
# ╚════════════════════════════════════════════╝
echo ""
echo "══════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo ""
echo "  🌐 Site     : https://${DOMAIN}"
echo "  🔧 Admin    : https://${DOMAIN}/admin/"
echo "  📊 API      : https://${DOMAIN}/api/"
echo ""
echo "  📝 Actions restantes :"
echo "     1. Créer un superuser : cd ${PROJECT_DIR}/backend && source venv/bin/activate && python manage.py createsuperuser"
echo "     2. Modifier les identifiants email dans ${PROJECT_DIR}/backend/.env"
echo "     3. Charger les données : python seed_data.py && python seed_vehicles_full.py"
echo "══════════════════════════════════════════════"
