FROM node:12 as build-stage
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
WORKDIR /usr/src/app/client
RUN yarn global add @vue/cli
RUN yarn install
RUN yarn build
FROM node:12-alpine as production-stage
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime
RUN echo "Europe/Berlin" >  /etc/timezone
RUN apk del tzdata
RUN mkdir /app
WORKDIR /usr/src/app
COPY --from=build-stage /usr/src/app ./
RUN rm -r ./client/*
COPY --from=build-stage /usr/src/app/client/dist ./client/dist
EXPOSE 5050
CMD [ "node", "app.js"]