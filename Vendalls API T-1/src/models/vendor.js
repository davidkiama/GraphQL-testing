"use strict";

const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: { unique: true },
  },
  email: {
    type: String,
    required: true,
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
  },
  tel: {
    type: String,
    required: true,
  },
  paybill: {
    type: String,
    required: true,
  },
});

const Vendor = mongoose.model("Vendor", VendorSchema);
module.exports = Vendor;
