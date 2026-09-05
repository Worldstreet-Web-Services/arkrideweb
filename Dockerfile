# syntax=docker/dockerfile:1

# =========================
# Dependencies
# =========================
FROM node:20-alpine AS deps

WORKDIR /app

# Only the manifests, so this layer is cached until dependencies actually
# change — the Privy tree is ~990 packages and re-resolving it on every source
# edit makes deploys several minutes slower than they need to be.
COPY package.json package-lock.json ./
RUN npm ci


# =========================
# Builder
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time only. The app reads ARKRIDE_API_URL at RUNTIME from the server
# environment, never from the bundle, so nothing here bakes an API host into
# the client JavaScript.
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_ variables are inlined at build time by definition — they are
# compiled into the client bundle, so they must be present now, not at
# runtime. The Privy app id is a public client identifier, so this is safe.
ARG NEXT_PUBLIC_PRIVY_APP_ID
ENV NEXT_PUBLIC_PRIVY_APP_ID=${NEXT_PUBLIC_PRIVY_APP_ID}

RUN npm run build


# =========================
# Runtime
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Never run the server as root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# `standalone` already contains the server and only the modules it traced, so
# node_modules is deliberately not copied. Static assets and /public are not
# part of the trace and have to come across separately.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Railway injects PORT and expects the process to bind it. Binding 0.0.0.0
# rather than localhost is required, or the healthcheck cannot reach it.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
