# Thermomat

# ESP Wiring

| From     | To                                                                                       |
| -------- | ---------------------------------------------------------------------------------------- |
| VCC      | +                                                                                        |
| GPIO14   | Female cable or switch to ground (used to reset WIFI and Server Settings when set to low |
| CH_PC/EN | +                                                                                        |
| REST/RST | GPIO16                                                                                   |
| TX       | RX                                                                                       |
| RX       | TX                                                                                       |
| GPIO04   | Roatary encoder PIN1                                                                     |
| GPIO05   | Roatary encoder PIN2                                                                     |
| GPIO0    | GND for programming                                                                      |
| GPIO15   | GND                                                                                      |
| GND      | GND                                                                                      |

# Thermostat Wiring

| From                 | To     |
| -------------------- | ------ |
| Roatary encoder PIN1 | GPIO04 |
| Roatary encoder PIN2 | GPIO05 |
| Roatary encoder GND  | GND    |
| +                    | VCC    |
| GND                  | GND    |

# Arduino IDE Settings

1. Datei -> Voreinstellungen -> Zusätzliche Boardverwalter-URLs : http://arduino.esp8266.com/stable/package_esp8266com_index.json einfügen

2. Werkzeuge -> Boards:
   Generic ESP8266 Module auswählen

3. Werkzeuge -> Flash Size:
   512KB (FS:64KB) auswählen

4. Werkzeuge -> Serieller Monitor -> 115200 Baud:
   um Daten zu empfangen

# How to flash assembly

1. Restart device with GPIO0 connected to Programmer GND to go into flash mode.
2. Press compile and upload Sketch
3. When IDE is trying to connect, connect 3.3V to VCC

| From            | To    |
| --------------- | ----- |
| Programmer GND  | GPIO0 |
| Programmer TX   | RX    |
| Programmer RX   | TX    |
| Programmer 3.3V | VCC   |

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
