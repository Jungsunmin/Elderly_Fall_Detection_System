FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install prisma@6.2.1 @prisma/client@6.2.1 && npm install

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "npx prisma@6.2.1 generate && npm run dev"]
