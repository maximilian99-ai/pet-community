FROM node:20.5.1-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run prisma:generate

EXPOSE 5000

CMD ["npm", "run", "dev"]
