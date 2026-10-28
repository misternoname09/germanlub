# =============================================================
# 📋 Fichiers de déploiement — GermanLub Shop
# =============================================================
#
# Ce dossier contient tout le nécessaire pour déployer
# GermanLub Shop sur un VPS OVH VPS-1.
#
# ┌─────────────────────────────────────────────┐
# │  Fichiers                                   │
# ├─────────────────────────────────────────────┤
# │  deploy.sh          Script d'installation   │
# │                     complète (1ère fois)     │
# │  update.sh          Script de mise à jour    │
# │                     (après modifications)    │
# │  nginx.conf         Config Nginx             │
# │  germanlub.service  Service systemd Gunicorn │
# └─────────────────────────────────────────────┘
#
# ═══ DÉPLOIEMENT INITIAL ═══
#
# 1. Commander un VPS OVH VPS-1 (Ubuntu 22.04/24.04)
# 2. Pointer le DNS OVH vers l'IP du VPS
# 3. Se connecter au VPS : ssh root@<IP>
# 4. Transférer le projet :
#      scp -r . root@<IP>:/var/www/germanlub/
#    OU
#      git clone <URL_REPO> /var/www/germanlub
# 5. Modifier les variables dans deploy.sh :
#      - DOMAIN="votre-domaine.com"
#      - DB_PASSWORD="un_mot_de_passe_fort"
# 6. Exécuter : sudo chmod +x deploy.sh && sudo ./deploy.sh
# 7. Créer le superuser Django
# 8. Charger les données initiales
#
# ═══ MISES À JOUR ═══
#
# 1. Pousser les modifications sur Git
# 2. Sur le VPS : sudo ./update.sh
#
# ═══ COMMANDES UTILES ═══
#
#   sudo systemctl status germanlub   → Statut du backend
#   sudo systemctl restart germanlub  → Redémarrer Django
#   sudo nginx -t                     → Tester la config Nginx
#   sudo systemctl reload nginx       → Recharger Nginx
#   sudo journalctl -u germanlub -f   → Logs Django en direct
#   sudo certbot renew --dry-run      → Tester le renouvellement SSL
# =============================================================
