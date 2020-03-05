import axios from "axios";
let api;
async function request(method, url, params) {
  let config = {
    method,
    url
  };
  if (method === "get") {
    config.params = params;
  } else if (method === "post") {
    config.data = params;
  }
  let result = {};
  try {
    const requestResult = await api.request(config);
    result.response = requestResult.data;
  } catch (e) {
    result.error = e.data;
  }
  return result;
}

export default class API {
  constructor(config, router) {
    const baseURL = `${config.proto}://${config.host}:${config.port}`;
    api = axios.create({
      baseURL
    });
    api.interceptors.response.use(response => response, (error) => {
      if (error.response.status === 401) {
        router.push('/login');
      }
      return Promise.reject(error.response);
    });
  }

  login(name, password) {
    return request("post", "/login", {
      name,
      password
    });
  }

  logout() {
    return request("get", "/logout");
  }

  getAllRooms() {
    return request("get", "/room/getall");
  }

  getAllPlans(room) {
    return request("get", "/plan/getall", {
      room
    });
  }

  addPlan(room, name) {
    return request("post", "/plan/add", {
      room,
      name
    });
  }

  deletePlan(room, name) {
    return request("post", "/plan/delete", {
      room,
      name
    });
  }

  activatePlan(room, name) {
    return request("post", "/plan/activate", {
      room,
      name
    });
  }

  deactivatePlan(room, name) {
    return request("post", "/plan/deactivate", {
      room,
      name
    });
  }

  getAllTemperatures(room, plan) {
    return request("get", "/temperature/getall", {
      room,
      plan
    });
  }

  addTemperature(room, plan, day, time, temp) {
    return request("post", "/temperature/add", {
      room,
      plan,
      day,
      time,
      temp
    });
  }

  deleteTemperature(room, plan, day, time) {
    return request("post", "/temperature/delete", {
      room,
      plan,
      day,
      time
    });
  }
}