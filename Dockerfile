FROM --platform=amd64 node:19.5.0-alpine AS base
WORKDIR /usr/src/app
COPY package-lock.json package.json ./
RUN npm ci

FROM mendersoftware/gui:base AS disclaim
RUN npm run disclaim

FROM base AS build
COPY . ./
RUN npm run build

FROM nginx:1.23.3-alpine
EXPOSE 8080
RUN mkdir -p /var/www/mender-gui/dist
WORKDIR /var/www/mender-gui/dist
ARG GIT_COMMIT_TAG
ENV GIT_COMMIT_TAG="${GIT_COMMIT_TAG:-local_local}"

COPY ./entrypoint.sh /entrypoint.sh
COPY httpd.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist .

ENTRYPOINT ["/entrypoint.sh"]
HEALTHCHECK --interval=8s --timeout=15s --start-period=120s --retries=128 CMD wget --quiet --tries=1 --spider --output-document=/dev/null 127.0.0.1
CMD ["nginx"]
