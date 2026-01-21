# 빌드 스테이지
FROM node:20.5.1-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install -g pnpm@9.0.0
RUN pnpm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Generate Prisma client
WORKDIR /app/backend
RUN pnpm prisma:generate

# Build backend
RUN pnpm build

# Build frontend
WORKDIR /app/frontend
RUN pnpm build

# 프로덕션 스테이지
FROM node:20.5.1-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy backend production files
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/pnpm-lock.yaml* ./
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/prisma ./prisma

# Install production dependencies only
RUN pnpm install --only=production

EXPOSE 5001

CMD ["node", "dist/index.js"]
