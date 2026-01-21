# 빌드 스테이지
FROM node:20.5.1-alpine AS builder

WORKDIR /app

# Install pnpm and dependencies
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@9.0.0
RUN pnpm install

COPY . .

RUN pnpm prisma:generate

RUN pnpm build

# Keep only production dependencies for the runtime image
RUN pnpm prune --prod

# 프로덕션 스테이지
FROM node:20.5.1-alpine

WORKDIR /app

# 빌드된 파일과 Prisma 클라이언트 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 5001

CMD ["node", "dist/index.js"]
