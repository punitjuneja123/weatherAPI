const express = require("express");
const port = 8080;
const rateLimit = require("express-rate-limit");
const winston = require("winston");
const expressWinston = require("express-winston");
require("dotenv").config();

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
app.use(express.json());

const { connection } = require("./config/config");
const { userRoute } = require("./route/user.route");
const { authentication } = require("./middleware/authentication.middleware");
const { weatherRoute } = require("./route/wether.route");

app.use(
  expressWinston.logger({
    statusLevels: true,
    transports: [
      new winston.transports.File({
        level: "error",
        json: true,
        filename: "error.json",
      }),
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  })
);

app.get("/", (req, res) => {
  res.send("welcome to weather api");
});
app.use("/weather/:city", limiter);
app.use(userRoute);
app.use(authentication);
app.use(weatherRoute);

app.listen(port, async () => {
  try {
    await connection;
    console.log("connected to mongodb");
  } catch (error) {
    console.log(error);
  }
  console.log("running at port", port);
});
