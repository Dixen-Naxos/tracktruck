# ─────────────────────────────────────────────
# Stage 1 — build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# .env is copied above — Next.js reads it automatically during build,
# baking NEXT_PUBLIC_* vars into the JS bundle.
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 — production
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Bind to all interfaces so Docker can route traffic to the container.
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
