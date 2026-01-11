# Déploiement VPS — Trustplay Backend (PM2 + Nginx + SSL)

Ce guide couvre le déploiement sur VPS via **FileZilla (SFTP)**, **SSH**, **PM2**, **Nginx** et **Let’s Encrypt**.

## 1) Upload du code via FileZilla (SFTP)
1. Ouvrir FileZilla et configurer une connexion SFTP.
2. Destination sur le serveur : `/var/www/trust-api`.
3. Uploader **le dossier `backend/`** (ou son contenu) dans `/var/www/trust-api`.

> ✅ Assurez-vous que `node_modules/`, `.env` et `uploads/` ne sont pas versionnés (cf. `.gitignore`).

## 2) Connexion SSH & dépendances
```bash
ssh root@<VPS_IP>

# Pré-requis Node 20+ (ex. NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v

# Installer PM2 globalement
sudo npm install -g pm2
```

## 3) Installation de l’API
```bash
cd /var/www/trust-api/backend
npm install --omit=dev
```

## 4) Configuration .env (exemple prod)
Créer `/var/www/trust-api/backend/.env` :
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster/db
JWT_SECRET=super-secret
API_PUBLIC_URL=https://api.trust-group.agency
CORS_ORIGIN=https://www.trust-group.agency,https://trust-cms-git-main-christodules-projects.vercel.app
FRONTEND_URL=https://www.trust-group.agency
UPLOAD_DIR=/var/www/trust-api/backend/uploads
ADMIN_EMAILS=admin@trust-group.agency

# SMTP (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=app-password
MAIL_FROM="Trustplay <you@gmail.com>"
```

## 5) Lancer avec PM2
```bash
cd /var/www/trust-api/backend
pm2 start api/index.js --name trustplay-api
pm2 save
pm2 startup
```

## 6) Configurer Nginx (reverse proxy)
Créer `/etc/nginx/sites-available/trust-api` :
```nginx
server {
  listen 80;
  server_name api.trust-group.agency;

  client_max_body_size 50M;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Activer & relancer Nginx :
```bash
sudo ln -s /etc/nginx/sites-available/trust-api /etc/nginx/sites-enabled/trust-api
sudo nginx -t
sudo systemctl reload nginx
```

## 7) SSL (Let’s Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.trust-group.agency
```

## 8) Vérifications rapides
```bash
# Santé API
curl https://api.trust-group.agency/api/health

# Headers de l’upload public
curl -I https://api.trust-group.agency/uploads/<file>
```

## 9) Mise à jour ultérieure
1. Upload de la nouvelle version avec FileZilla.
2. SSH : `cd /var/www/trust-api/backend && npm install --omit=dev` si deps changées.
3. Redémarrer : `pm2 restart trustplay-api`.
