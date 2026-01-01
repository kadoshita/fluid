FROM node:24.12.0-bullseye-slim

WORKDIR /usr/local/src
ENV TZ Asia/Tokyo
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "npm", "run", "nextstart" ]
