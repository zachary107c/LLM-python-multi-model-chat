FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install

COPY frontend ./
COPY frontend/.env ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]