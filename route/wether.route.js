const express = require("express");
require("dotenv").config();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

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

const weatherRoute = express.Router();

const { weatherSearchModel } = require("../model/weathersearch.model");
const { cityValidator } = require("../middleware/cityVilidator.middleware");

weatherRoute.get("/weather/:city", async (req, res) => {
  let city = req.params.city;

  let flag = false;
  for (let i = 0; i < city.length; i++) {
    if (+city[i]) {
      flag = true;
      res.send("city name shouldn't contain any number");
      break;
    }
  }
  if (flag == false) {
    let checkData = JSON.parse(await clint.get(city));
    if (checkData) {
      console.log("yes");
      res.send(checkData);
    } else {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.apikey}`
      );
      const data = await response.text();
      //   storing in db
      let check = await weatherSearchModel.find({
        city,
        userID: req.body.userID,
      });
      if (check.length == 0) {
        let storedData = weatherSearchModel({
          city,
          data,
          userID: req.body.userID,
        });
        await storedData.save();
      }
      //   setting city in redis
      await clint.SETEX(city, 60 * 30, JSON.stringify(data));
      res.send(data);
    }
  }
});

module.exports = { weatherRoute };
