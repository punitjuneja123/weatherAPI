const jwt = require("jsonwebtoken");
require("dotenv").config();

const redis = require("redis");
const clint = redis.createClient();

async function connectRedis() {
  try {
    await clint.connect();
  } catch (error) {
    client.on("error", (err) => console.log("Redis Client Error", err));
  }
}
connectRedis();

async function authentication(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    let checkLogout = await clint.get(token);
    if (checkLogout) {
      res.send("user logout please login again and provide a new token");
    } else {
      jwt.verify(token, process.env.secret, (err, response) => {
        if (err) {
          res.send("please provide a correct token");
        } else {
          req.body.userID = response.userID;
          next();
        }
      });
    }
  } else {
    res.send("please login first");
  }
}

module.exports = { authentication };
