FROM node:16

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY app .
ENV NODE_ENV=production

CMD [ "node", "--experimental-json-modules", "index.js" ]