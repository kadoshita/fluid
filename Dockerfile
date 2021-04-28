FROM node:14.16.0-buster

WORKDIR /usr/local/src
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "npm", "run", "nextstart" ]