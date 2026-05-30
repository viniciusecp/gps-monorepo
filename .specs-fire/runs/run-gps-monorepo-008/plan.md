# Execution Plan: Docker Backend Deploy

## Overview

Create production Docker configuration for the Fastify backend API.

## Work Items

### 1. create-dockerfile
- Create `server/Dockerfile` with multi-stage build
- Stage 1: Build TypeScript with pnpm
- Stage 2: Runtime image with only compiled output and production deps
- Exposed port: 3333 (configurable via PORT env var)

### 2. create-docker-compose
- Create `server/docker-compose.yml`
- Service references local Dockerfile
- Restart policy: always
- Environment: load from `.env`
- Port mapping: 3333:3333

## Technical Details

- **Base Image**: Node.js LTS (alpine recommended for size)
- **Package Manager**: pnpm (must use Docker layer caching)
- **Node Environment**: NODE_ENV=production
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `node dist/index.js`