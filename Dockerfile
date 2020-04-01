FROM node:12.13-alpine3.9

ENV NODE_ENV production
WORKDIR /usr/src/spotiparty-api/app
COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production && mv node_modules ../
COPY . .

EXPOSE 80
CMD npm start
