const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

const userRoute = express.Router();

const { userModel } = require("../model/user.model");

userRoute.post("/register", async (req, res) => {
  let { name, email, password } = req.body;
  let checkData = await userModel.find({ email });
  if (checkData.length == 0) {
    bcrypt.hash(password, 5, async function (err, hash) {
      if (err) {
        res.status(400);
        res.send("something went wrong");
      } else {
        let data = new userModel({ name, email, password: hash });
        await data.save();
        res.send("user registered");
      }
    });
  } else {
    res.send("user already exists");
  }
});

userRoute.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let checkData = await userModel.find({ email });
  if (checkData.length > 0) {
    bcrypt.compare(password, checkData[0].password, async (err, result) => {
      if (result) {
        let token = jwt.sign({ userID: checkData[0]._id }, process.env.secret);
        res.send({ msg: "login successful", token: token });
      } else {
        res.status("400");
        res.send("wrong password");
      }
    });
  } else {
    res.status(400);
    res.send("wrong credentials");
  }
});

userRoute.post("/logout", async (req, res) => {
  const { token } = req.body;
  await clint.SET(`${token}`, "1");
  res.send("user logout");
});

module.exports = { userRoute };
