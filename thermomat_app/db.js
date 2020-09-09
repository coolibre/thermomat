const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("./db/db.json");
const db = low(adapter);

db.defaults({
  rooms: [],
  plans: [],
  temps: [],
  users: [],
}).write();

class DB {
  addUser(name, password) {
    const user = db
      .get("users")
      .filter({
        name,
      })
      .value();
    if (user.length > 0) {
      return db
        .get("users")
        .find({
          name,
        })
        .assign({
          password,
        })
        .write();
    }
    return db
      .get("users")
      .push({
        name,
        password,
      })
      .write();
  }

  getUser(name) {
    const user = db
      .get("users")
      .filter({
        name,
      })
      .value();
    if (!user) throw Error("User not found");
    return user[0];
  }

  deleteUser(name) {
    if (this.getUser(name).length === 0) throw Error("User doesn't exists");
    return db
      .get("users")
      .remove({
        name,
      })
      .write();
  }

  addRoom(name) {
    const room = {
      name,
    };
    if (this.getRoom(name).length > 0) throw Error("Room already exists");
    return db.get("rooms").push(room).write();
  }

  getRoom(name) {
    const room = db
      .get("rooms")
      .filter({
        name,
      })
      .value();
    if (!room) throw Error("Room not found");
    return room;
  }

  getRooms() {
    const room = db.get("rooms").value();
    return room;
  }

  getPlan(id) {
    const plan = db
      .get("plans")
      .filter({
        id,
      })
      .value();
    if (!plan) throw Error("Plan not found");
    return plan;
  }

  addPlan(room, name, active = false) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    if (this.getPlan(`${room}.${name}`).length > 0)
      throw Error("Plan already exists");
    let plan = {
      room,
      name,
      id: `${room}.${name}`,
      active,
    };
    return db.get("plans").push(plan).write();
  }

  deletePlan(room, name) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    if (this.getPlan(`${room}.${name}`).length === 0)
      throw Error("Plan doesnt't exists");
    return db
      .get("plans")
      .remove({
        room,
        name,
      })
      .write();
  }

  activatePlan(room, name) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    if (this.getPlan(`${room}.${name}`).length === 0)
      throw Error("Plan doesn't exists");
    const plans = this.getPlans(room);
    // deactivate plans
    for (const plan of plans) {
      db.get("plans")
        .find({
          id: plan.id,
        })
        .assign({
          active: false,
        })
        .write();
    }
    db.get("plans")
      .find({
        room,
        name,
      })
      .assign({
        active: true,
      })
      .write();
  }

  deactivatePlan(room, name) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    if (this.getPlan(`${room}.${name}`).length === 0)
      throw Error("Plan doesn't exists");
    db.get("plans")
      .find({
        room,
        name,
      })
      .assign({
        active: false,
      })
      .write();
  }

  getPlans(room) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    const plans = db
      .get("plans")
      .filter({
        room,
      })
      .value();
    return plans;
  }

  addTemp(room, plan, day, time, temp) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    if (this.getPlan(`${room}.${plan}`).length === 0)
      throw Error("Plan doesn't exists");
    if (this.getTemp(room, plan, day, time).length > 0) {
      // perform update
      return db
        .get("temps")
        .find({
          room,
          plan,
          day,
          time,
        })
        .assign({
          temp,
        })
        .write();
    }
    return db
      .get("temps")
      .push({
        room,
        plan,
        day,
        time,
        temp,
      })
      .write();
  }

  deleteTemp(room, plan, day, time) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    if (this.getPlan(`${room}.${plan}`).length === 0)
      throw Error("Plan doesn't exists");
    if (this.getTemp(room, plan, day, time).length === 0)
      throw Error("Temperature doesn't exists");
    return db
      .get("temps")
      .remove({
        room,
        plan,
        day,
        time,
      })
      .write();
  }

  getTemps(room, plan) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    if (this.getPlan(`${room}.${plan}`).length === 0)
      throw Error("Plan doesn't exists");
    const temps = db
      .get("temps")
      .filter({
        room,
        plan,
      })
      .value();
    return temps;
  }

  getTemp(room, plan, day, time) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    if (this.getPlan(`${room}.${plan}`).length === 0)
      throw Error("Plan doesn't exists");
    const temp = db
      .get("temps")
      .filter({
        room,
        plan,
        day,
        time,
      })
      .value();
    return temp;
  }

  getCurrentTemperature(room) {
    if (this.getRoom(room).length === 0) throw Error("Room doesn't exists");
    const activePlan = db
      .get("plans")
      .filter({
        room,
        active: true,
      })
      .head()
      .value();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDate = new Date();
    let currentDay = days[currentDate.getDay()];
    const compareDate = new Date(0);
    compareDate.setHours(currentDate.getHours());
    compareDate.setMinutes(currentDate.getMinutes());
    let tries = 0;
    let temps = [];
    let filtered = [];
    let sorted = [];
    while (activePlan && sorted.length === 0 && tries < days.length) {
      temps = db
        .get("temps")
        .filter({
          room,
          plan: activePlan.name,
          day: currentDay,
        })
        .value();
      filtered = temps.filter((temp) => new Date(temp.time) <= compareDate);
      sorted = filtered.sort((temp1, temp2) => {
        if (temp1.time > temp2.time) return -1;
        if (temp1.time < temp2.time) return 1;
        return 0;
      });
      if (sorted.length === 0) {
        tries++;
        currentDate.setDate(currentDate.getDate() - 1);
        currentDay = days[currentDate.getDay()];
        compareDate.setHours(23);
        compareDate.setMinutes(59);
      }
    }
    let result = sorted[0];
    if (result) result = result.temp.toString();
    else result = "0";
    return result;
  }
}
module.exports = new DB();
