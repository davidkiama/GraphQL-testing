"use strict";

//Require the mongoose library
const mongoose = require("mongoose");

module.exports = {
  connect: (DB_HOST) => {
    //Use the mongo driver's updated url string parser
    mongoose.set("useNewUrlParser", true);
    //extra

    //Use findOneAndUpdate() in place of findAndModify()
    mongoose.set("useFindAndModify", false);

    //Use createIndex() in place of ensureIndex()
    mongoose.set("useCreateIndex", true);

    //Use the new server discovery and monitoring engine
    mongoose.set("useUnifiedTopology", true);

    //Connect to the DB
    mongoose.connect(DB_HOST);

    //Log an error if we fail to connect
    mongoose.connection.on("error", (err) => {
      console.log("Mongo error. Make sure mongoDB is running");
      console.error(err);
      process.exit();
    });
  },
  close: () => {
    mongoose.connection.close();
  },
};
