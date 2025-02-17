FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# RUN npm ci --only=production --save
RUN npm install --save

COPY . ./
COPY .env ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]