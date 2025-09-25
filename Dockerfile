# Multi-stage build frontend Vite + Nginx
FROM node:20-alpine AS build
WORKDIR /app
# Copier uniquement les manifests pour tirer parti du cache
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

