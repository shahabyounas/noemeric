const mongoose = require("mongoose");

const user = mongoose.Schema({
  name: String,
  email: String,
  address: String
});

module.exports = mongoose.model("user", user);
