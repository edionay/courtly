FROM node:24.22.3-alpine

WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY frontend frontend
RUN npm run build --workspace frontend

EXPOSE 4173
CMD ["npm", "run", "preview", "--workspace", "frontend", "--", "--host", "0.0.0.0", "--port", "4173"]
