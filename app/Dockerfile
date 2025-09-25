# syntax=docker/dockerfile:1

FROM node:20-alpine

# Install OS deps (optional)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package manifests first for better caching
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* .npmrc* ./

# Install deps
RUN npm ci || npm install

# Copy rest of the source
COPY . .

# Prisma: ensure client can be generated
RUN npx prisma generate

EXPOSE 3000

# Default command overridden by compose
CMD ["npm", "run", "dev"]