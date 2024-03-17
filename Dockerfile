FROM node:20-bullseye as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY apps/ apps/

RUN npm ci
RUN npm run build -w apps/backend
RUN npm ci --omit=dev --ignore-scripts

FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

COPY --from=builder /app/apps/backend/build/ /app/apps/backend/build/
COPY --from=builder /app/apps/backend/package.json /app/apps/backend/package.json
COPY --from=builder /app/node_modules/ /app/node_modules/

EXPOSE 3000
ENV NODE_ENV=production

CMD ["apps/backend/build/main.js"]
