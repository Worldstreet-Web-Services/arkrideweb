# syntax=docker/dockerfile:1

# =========================
# Dependencies
# =========================
#
# node 22, not 20: several packages in the Privy dependency tree declare
# `engines.node >= 22` (@solana/wallet-standard-features, @wallet-standard/*).
# npm only warns about that, but shipping a runtime the dependencies say they
# do not support is borrowing a failure from later.
#
# Debian slim, not alpine. `bufferutil` — an optional native dep of `ws`, which
# arrives through the WalletConnect tree — publishes no prebuilt binary for
# musl, so on alpine npm falls back to node-gyp and the build dies looking for
# a Python that alpine does not ship. Adding build tools would fix it at the
# cost of a compiler in the build image and a much slower install; Debian just
# has the prebuilt binary. It is also the base sharp officially supports, which
# matters for Next's image optimisation.
FROM node:22-slim AS deps

WORKDIR /app

# `bufferutil` and `utf-8-validate` are optional native dependencies of `ws`,
# pulled in by WalletConnect inside the Privy tree. Neither publishes a
# prebuilt binary for every platform, so npm falls back to node-gyp and the
# install dies looking for a compiler.
#
# Both are pure performance optimisations that `ws` runs fine without, and
# nothing here uses `ws` directly — but npm still fails the whole install when
# an optional build fails, so the toolchain has to be present.
#
# This lands in the DEPS stage only. The runtime image copies just Next's
# standalone output, so no compiler ever reaches the deployed container.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# Only the manifests, so this layer is cached until dependencies actually
# change — the Privy tree is ~990 packages and re-resolving it on every source
# edit makes deploys several minutes slower than they need to be.
COPY package.json package-lock.json ./
RUN npm ci


# =========================
# Builder
# =========================
FROM node:22-slim AS builder

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
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Never run the server as root.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

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
