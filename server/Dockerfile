# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy monorepo config preserving workspace structure
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY server/package.json server/

# Install dependencies (workspace-aware)
RUN pnpm install --frozen-lockfile

# Copy server source and build
COPY server/ server/
RUN pnpm --filter gps-api build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only what's needed at runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/server/node_modules ./server/node_modules

# Set environment
ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

# Run the application
CMD ["node", "server/dist/index.js"]
