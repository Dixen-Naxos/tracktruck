# ─────────────────────────────────────────────
# Stage 1 — build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 — production
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# firebase-service-account.json must be mounted at runtime, e.g.:
#   docker run -v ./firebase-service-account.json:/app/firebase-service-account.json
# or set FIREBASE_SERVICE_ACCOUNT to an absolute path via env.

EXPOSE 3000

CMD ["node", "dist/index.js"]
