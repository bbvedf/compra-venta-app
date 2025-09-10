# client/Dockerfile
FROM node:20

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "start"]