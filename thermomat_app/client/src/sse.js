const url = `${process.env.VUE_APP_PROTOCOL}://${process.env.VUE_APP_HOST}:${process.env.VUE_APP_PORT}/stream`;
const es = new EventSource(url);
const listen = (eventName, callback) => {
  es.addEventListener(eventName, (evt) => {
    callback(JSON.parse(evt.data));
  });
};
export default {
  listen,
};
