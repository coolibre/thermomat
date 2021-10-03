import getEnv from "./env";
const url = `${getEnv("VUE_APP_PROTOCOL")}://${getEnv("VUE_APP_HOST")}:${getEnv(
  "VUE_APP_PORT"
)}/stream`;
export default class SSE {
  listen(eventName, callback) {
    if (!this.eventSource) {
      this.eventSource = new EventSource(url);
    }
    this.eventSource.addEventListener(eventName, (evt) => {
      callback(JSON.parse(evt.data));
    });
  }
}
