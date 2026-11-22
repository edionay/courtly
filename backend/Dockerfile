FROM node:24.22.3-alpine

WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY backend backend
COPY frontend/package.json frontend/package.json
RUN npm run build --workspace backend

EXPOSE 3000
CMD ["sh", "-c", "npm run db:deploy --workspace backend && npm run db:seed --workspace backend && npm start --workspace backend"]
