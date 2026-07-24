# ---- deps ----
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- builder ----
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=G2JJQRhnVO8lj37ZFRmB2/s+nBCVz2dp3OAJ9rQzH7M=
ENV DATABASE_URL=postgresql://usuario:senha@localhost:5432/http-scheduller
ENV PORT=3000
ENV TZ=America/Sao_Paulo
ENV AUTHENTIK_USERNAME=http-scheduller-service-account
ENV AUTHENTIK_PASSWORD=sua-senha
ENV AUTHENTIK_URL=https://sso.seudominio.com
ENV REDIS_CACHE_URL=redis://localhost:6379

RUN bun run build

# ---- runner ----
FROM oven/bun:1-slim AS runner
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone/app /app
COPY --from=builder /app/public /app/public
COPY --from=builder /app/.next/static /app/.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["bun", "/app/server.js"]
