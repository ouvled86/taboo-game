FROM alpine:3.22.3

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package.json ./

RUN npm install --production

COPY server.js ./
COPY words/ ./words/
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "server.js"]
