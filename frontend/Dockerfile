FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite가 모든 호스트(0.0.0.0)에서 접속을 허용하도록 설정
CMD ["npm", "run", "dev", "--", "--host"]
