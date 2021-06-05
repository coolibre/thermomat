#!/bin/sh
JSON_STRING='{ \
  "VUE_APP_HOST":"'"${VUE_APP_HOST}"'", \
  "VUE_APP_PORT":"'"${VUE_APP_PORT}"'", \
  "VUE_APP_PROTOCOL":"'"${VUE_APP_PROTOCOL}"'", \
}'
sed -i "s@{}@${JSON_STRING}@" /usr/src/app/client/dist/config.js
exec "$@"