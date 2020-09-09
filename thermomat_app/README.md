# How to develop

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
# start client build and watch for filechanges
npx vue-cli-service build --watch
```

# Deployment

## Build

```bash
docker build . -t thermomat
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
    image: thermomat:latest
    restart: always
    ports:
      - 5050:5050
    expose:
      - 5050
    environment:
      - LOCAL_IPS=192.168.0.0/24,127.0.0.1
      - VIRTUAL_HOST=<your host>
      - LETSENCRYPT_HOST=<your host>
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

- from local network run

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"username":"xyz","password":"xyz"}' \
  http://<local host ip>:5050/user/add
```
