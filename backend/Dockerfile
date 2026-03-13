# ═══════════════════════════════════════════════════════════════════
# BloodConnect — Backend API Server (Production Docker Image)
# Multi-stage build for minimal image size (~150MB vs 1GB+)
# ═══════════════════════════════════════════════════════════════════

# ─── Stage 1: Install dependencies ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps

# ─── Stage 2: Production image ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non‑root user
RUN addgroup -g 1001 -S nodejs && adduser -S bloodconnect -u 1001

# Copy only production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create logs directory
RUN mkdir -p logs && chown -R bloodconnect:nodejs logs

USER bloodconnect

# Expose API port
EXPOSE 5000

# Health check for orchestrators (Docker Swarm / K8s / ECS)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the clustered API server
CMD ["node", "index.js"]
