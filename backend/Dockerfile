# 빌드 스테이지
FROM node:20.5.1-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run prisma:generate

RUN npm run build

# 프로덕션 스테이지
FROM node:20.5.1-alpine

WORKDIR /app

# 필요한 패키지만 설치 (프로덕션)
COPY package.json package-lock.json* ./
RUN npm install --only=production

# 빌드된 파일과 Prisma 클라이언트 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 5001

CMD ["node", "dist/index.js"]
