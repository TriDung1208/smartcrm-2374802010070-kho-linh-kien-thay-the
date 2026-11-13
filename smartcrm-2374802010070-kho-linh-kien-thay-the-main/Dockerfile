FROM node:24-bookworm-slim AS dependencies

WORKDIR /app/src/backend
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY src/backend/package.json src/backend/package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production \
    APP_PORT=3000 \
    SMARTCRM_DB_PATH=/app/data/smartcrm.db

WORKDIR /app/src/backend
COPY --from=dependencies /app/src/backend/node_modules ./node_modules
COPY src/backend/package.json src/backend/server.js ./
COPY src/backend/database ./database
COPY src/backend/src ./src
COPY src/frontend /app/src/frontend

RUN apt-get update \
    && apt-get install -y --no-install-recommends libstdc++6 libatomic1 \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app/data \
    && chown -R node:node /app
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
