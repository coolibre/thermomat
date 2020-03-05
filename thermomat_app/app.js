const express = require('express');
const helmet = require('helmet');
const SSE = require('express-sse');
const conf = require("./config");
const cors = require("cors");
const cookieSession = require('cookie-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const app = express();
const db = require("./db");
const ipfilter = require('express-ipfilter').IpFilter;
const IPS = conf.LOCAL_IPS;
const customDetection = req => {
  return req.connection.remoteAddress.replace("::ffff:", "");
}
const sse = new SSE([], {
  isSerialized: true
});
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: 'mysession',
  keys: ['vueauthrandomkey'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy({
      usernameField: "name",
      passwordField: "password"
    },
    async (username, password, done) => {
      let result;
      const user = db.getUser(username);
      const hash = user ? user.password : "";
      if (hash) {
        try {
          result = await bcrypt.compare(password, hash);
        } catch (error) {
          console.log(error);
        }
      }
      if (result) {
        done(null, user);
      } else {
        done(null, false, {
          message: 'Incorrect username or password'
        })
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.name)
})


passport.deserializeUser((name, done) => {
  let user = db.getUser(name);
  if (!user) {
    return done("not authorized", null);
  }
  done(null, user)
})

app.use(express.static('./client/dist'));
const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send(info);
    }
    req.login(user, err => {
      res.send("Logged in");
    });
  })(req, res, next);
});
app.get("/logout", authMiddleware, function (req, res) {
  req.logout();
  return res.send();
});
app.get('/stream', authMiddleware, sse.init);
app.post('/user/add', ipfilter(IPS, {
  mode: 'allow',
  detectIp: customDetection
}), async function (req, res) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    addRequest("addUser", [req.body.name, hash], res);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error on saving user");
  }
});
app.post('/user/delete', ipfilter(IPS, {
  mode: 'allow',
  detectIp: customDetection
}), function (req, res) {
  addRequest("deleteUser", [req.body.name], res);
});
app.get('/temperature/get', ipfilter(IPS, {
  mode: 'allow',
  detectIp: customDetection
}), function (req, res) {
  const room = req.query.room;
  try {
    db.addRoom(room);
    db.addPlan(room, "default", true);
    sse.send({
      "name": room
    }, "addedRoom");
  } catch (error) {
    if (error.message !== "Room already exists") {
      console.log(error);
      return res.status(500).send(error)
    }
  }
  res.send(db.getCurrentTemperature(room));
});
app.get('/temperature/getall', authMiddleware, function (req, res) {
  getRequest("getTemps", [req.query.room, req.query.plan], res);
});
app.post('/temperature/add', authMiddleware, function (req, res) {
  addRequest("addTemp", [req.body.room, req.body.plan, req.body.day, req.body.time, req.body.temp], res);
});
app.post('/temperature/delete', authMiddleware, function (req, res) {
  addRequest("deleteTemp", [req.body.room, req.body.plan, req.body.day, req.body.time], res);
});
app.post('/room/add', authMiddleware, function (req, res) {
  addRequest("addRoom", [req.body.name], res);
});
app.get('/room/get', authMiddleware, function (req, res) {
  getRequest("getRoom", [req.query.name], res);
});
app.get('/room/getall', authMiddleware, function (req, res) {
  getRequest("getRooms", [], res);
});
app.post('/plan/add', authMiddleware, function (req, res) {
  addRequest("addPlan", [req.body.room, req.body.name], res);
});
app.post('/plan/delete', authMiddleware, function (req, res) {
  addRequest("deletePlan", [req.body.room, req.body.name], res);
});
app.post('/plan/activate', authMiddleware, function (req, res) {
  addRequest("activatePlan", [req.body.room, req.body.name], res);
});
app.post('/plan/deactivate', authMiddleware, function (req, res) {
  addRequest("deactivatePlan", [req.body.room, req.body.name], res);
});
app.get('/plan/getall', authMiddleware, function (req, res) {
  getRequest("getPlans", [req.query.room], res);
});

function addRequest(dbFunction, dbParams, res) {
  try {
    db[dbFunction](...dbParams);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error.message);
  }
  res.send('ok');
}

function getRequest(dbFunction, dbParams, res) {
  let result;
  try {
    result = db[dbFunction](...dbParams);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error.message);
  }
  res.send(result);
}

app.listen(conf.PORT, "0.0.0.0");
console.log(`Server running on port ${conf.PORT}`)