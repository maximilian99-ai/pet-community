# Use backend Dockerfile directly
FROM node:20.5.1-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY backend/package.json backend/pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm@9.0.0
RUN pnpm install

# Copy backend source code
COPY backend/ ./

# Generate Prisma client and build
RUN pnpm prisma:generate
RUN pnpm build

# Keep only production dependencies for the runtime image
RUN pnpm prune --prod

# Production stage
FROM node:20.5.1-alpine

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 5001

CMD ["node", "dist/index.js"]
