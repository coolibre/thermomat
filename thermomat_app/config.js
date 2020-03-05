module.exports = {
  PORT: process.env.PORT || 5050,
  LOCAL_IPS: process.env.LOCAL_IPS ? process.env.LOCAL_IPS.split(",") : []
};