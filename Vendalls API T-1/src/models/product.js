"use strict";
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    requierd: true,
  },
  price: {
    type: Number,
    requied: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  favouriteCount: {
    type: Number,
    default: 0,
  },
  favouritedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
