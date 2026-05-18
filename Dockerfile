# Build stage
FROM node:22 AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


# Serve stage
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf

USER 101

EXPOSE 8080

CMD ["nginx","-g","daemon off;"]
