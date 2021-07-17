"use strict";

//Require the mongoose lib
const mongoose = require("mongoose");

//Define the product's schema
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    favoritedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    //Assigns createdAt and updatedAt field with datetype
    timestamps: true,
  }
);

//Define the Product model with the schema
const Product = mongoose.model("Product", productSchema);

//Export the module
module.exports = Product;
