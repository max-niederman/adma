FROM node:18.7-alpine

RUN ["npm", "install", "--global", "pnpm"]

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json pnpm-*.yaml ./
RUN ["pnpm", "install", "--frozen-lockfile"]

COPY src ./src

CMD ["node", "main.js"]