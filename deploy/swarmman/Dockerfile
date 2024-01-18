FROM node:18-alpine as builder
WORKDIR /usr/src/app
ADD *.json .
RUN npm ci
ADD . .
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/swarmman
COPY --from=builder /usr/src/app/build ./build
ADD *.json .
RUN npm ci --only=production
CMD ["node", "./build/index.js"]