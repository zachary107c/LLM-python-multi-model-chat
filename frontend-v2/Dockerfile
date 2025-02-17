FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . ./
COPY .env ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]