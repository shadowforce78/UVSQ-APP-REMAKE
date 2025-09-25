FROM node:20-alpine AS build
WORKDIR /app
# Copier uniquement les manifests pour tirer parti du cache
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime sans nginx.conf custom
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

