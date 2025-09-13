# Multi-stage build frontend Vite + Nginx
FROM node:20-alpine AS build
WORKDIR /app
# Copier uniquement les manifests pour tirer parti du cache
COPY package*.json ./
RUN npm install --omit=dev

# Copier le reste du code
COPY . .
# Construire (Vite sort dans dist/ par défaut)
RUN npm run build

# Étape Nginx légère
FROM nginx:alpine AS runtime
# Utilisation de la configuration Nginx par défaut (pas de proxy interne /api)
# Copier les assets statiques
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://localhost || exit 1
CMD ["nginx", "-g", "daemon off;"]
