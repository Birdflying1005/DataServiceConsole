var mongoose = require("mongoose");
var config = require("../../config").config;

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
  }
});

// models
require("./pmr");

exports.PmrInfo = mongoose.model("PmrInfo");