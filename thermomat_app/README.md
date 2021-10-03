# How to develop

## Requirements

- nodejs https://github.com/nvm-sh/nvm
- yarn https://classic.yarnpkg.com/en/docs/install/#debian-stable
- vuetify https://vuetifyjs.com/en/getting-started/installation/

## Server

```bash
# install server dependencies
npm install
# start app
node app.js
```

## client

```bash
# change to client directory
cd client
# install
yarn install
# start client build and watch for filechanges
npx vue-cli-service build --watch
```

## Testing

Use thermomat.postman_collection to play around. Or connect a real device and configure your development pc as endpoint in the WIFI manager.

# Deployment

## Build

```bash
docker build . -t thermomat
```

## Run
```bash
docker run -d -p 5050:5050 -e VUE_APP_HOST="yourexampledomain.net" thermomat:latest
```

## Example with compose

```yaml
version: "3"

services:
  proxy:
    build: ./proxy
    restart: always
    ports:
      - 80:80
      - 443:443
    labels:
      com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy: "true"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
    networks:
      - proxy-tier

  letsencrypt:
    image: jrcs/letsencrypt-nginx-proxy-companion
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - proxy-tier
    depends_on:
      - proxy

  thermomat:
    image: docker.pkg.github.com/coolibre/thermomat/thermomat:latest
    restart: always
    ports:
      - 5050:5050
    expose:
      - 5050
    environment:
      - LOCAL_IPS=192.168.0.0/24,127.0.0.1
      - VIRTUAL_HOST=yourexampledomain.net
      - LETSENCRYPT_HOST=yourexampledomain.net
      - VUE_APP_HOST=yourexampledomain.net
    volumes:
      - /usr/thermomat:/usr/src/app/db
    networks:
      - proxy-tier
    depends_on:
      - proxy

volumes:
  thermomat:

networks:
  proxy-tier:
```

# Usage

## Default User

Defaultwise a admin user is created with username **admin** and password **admin**. Its not recommended to use this in production. To change the defaultly created admin supply the environment variables **ADMIN_PASSWORD** and/or **ADMIN_USER**.

## Create other Users

Go to Users menu by clicking the menu on the right side ofthe top bar. As admin you can add, edit and delete other users. Normal users can only change their password.
