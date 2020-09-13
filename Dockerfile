FROM node:14.8.0-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY tsconfig*.json ./

COPY src src

RUN yarn run build

## 

FROM node:14.8.0-alpine

ENV NODE_ENV=production

RUN apk add --no-cache tini

WORKDIR /usr/src/app

RUN chown node:node .

USER node

COPY package.json yarn.lock ./

RUN yarn

COPY --from=builder /usr/src/app/dist/ dist/

EXPOSE 4000

ENTRYPOINT [ "/sbin/tini","--", "node", "lib/index.js" ]
