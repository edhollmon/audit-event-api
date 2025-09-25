FROM node:latest

COPY package*.json /app/

WORKDIR /app/

RUN npm install

COPY . /app/

CMD ["node", "index.js"]