FROM node:10.23.0-alpine3.10
LABEL org.opencontainers.image.source="https://github.com/vagnerr/estimation-matrix"
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ARG BUILD_VERSION=Unknown
RUN echo $BUILD_VERSION > public/version.txt
EXPOSE 3000
CMD ["node", "server.js"]
