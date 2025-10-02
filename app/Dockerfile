# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

# Install minimal OS dependency (no Python)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package manifests first for better caching
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* .npmrc* ./

# Install dependencies
RUN npm ci || npm install

# Copy application source
COPY . .

# Generate Prisma client (needed for build and runtime)
RUN npx prisma generate

# Build the application for production
ENV NODE_ENV=production
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only the necessary runtime artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the Next.js port
EXPOSE 3000

# Start the production server
CMD ["npm", "run", "start"]