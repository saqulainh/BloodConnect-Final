# ═══════════════════════════════════════════════════════════════════
# BloodConnect — Frontend Production Docker Image
# Multi-stage: Build with Node, Serve with Nginx (~25MB final image)
# ═══════════════════════════════════════════════════════════════════

# ─── Stage 1: Build the React app ─────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build args for Vite environment variables
ARG VITE_API_URL=http://localhost:5000
ARG VITE_PUSHER_KEY
ARG VITE_PUSHER_CLUSTER

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PUSHER_KEY=$VITE_PUSHER_KEY
ENV VITE_PUSHER_CLUSTER=$VITE_PUSHER_CLUSTER

RUN npm run build

# ─── Stage 2: Serve with Nginx ────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
