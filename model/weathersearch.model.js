const mongoose = require("mongoose");

const weatherSearchSchema = mongoose.Schema({
  city: String,
  data: Array,
  userID: String,
});

const weatherSearchModel = mongoose.model(
  "weatherSearches",
  weatherSearchSchema
);

module.exports = { weatherSearchModel };
