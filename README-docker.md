# Déploiement Docker / Docker Compose

## Architecture
Deux services :
- `uvsq-backend` (Express proxy -> API distante) écoute sur le port 3001
- `uvsq-frontend` (Build Vite statique servi par Nginx) sur le port 80

Le frontend proxy les requêtes `/api/*` vers le backend via Nginx (`nginx.conf`).

## Lancer les conteneurs
```bash
docker compose up -d --build
```
Accès :
- Frontend : http://localhost/
- Backend direct (debug) : http://localhost:3001/api/bulletin/test

## Arrêter et nettoyer
```bash
docker compose down
```
Pour supprimer les images construites :
```bash
docker compose down --rmi local --volumes --remove-orphans
```

## Rebuild forcé
```bash
docker compose build --no-cache uvsq-frontend uvsq-backend
docker compose up -d
```

## Résolution de l'erreur ENOENT (npm install)
Cause : le build utilisait le contexte `./src` (sans `package.json`). Le nouveau Dockerfile frontend (multi-stage) utilise la racine et copie d'abord `package*.json` puis installe les dépendances avant de copier le reste.

## Variables d'environnement
Modifiables dans `docker-compose.yml` :
- `NODE_ENV`, `PORT` (backend)
- `VIRTUAL_HOST`, `LETSENCRYPT_*` (si reverse proxy externe type nginx-proxy + letsencrypt-companion)

## Développement local (hors Docker recommandé)
```bash
npm install
npm run dev            # frontend (Vite)
cd server && npm install && node server.js  # backend
```
Hot reload + feedback rapide.

## Production
Le build final est statique (`dist`) servi par Nginx. Le backend reste un service Node léger.

## Healthcheck
Un healthcheck basique est défini pour le backend dans `docker-compose.yml`.

## Proxy Nginx
Extrait de `nginx.conf` :
```nginx
location /api/ {
  proxy_pass http://uvsq-backend:3001/api/;
}
```

## Étapes suivantes possibles
- Ajouter logs structurés (winston / pino)
- Ajouter un stage de tests CI avant build
- Servir assets lourds via CDN
- Activer compression Brotli (module nginx supplémentaire)
