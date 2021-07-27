"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");

module.exports = {
  createProduct: async (parent, args, { models, vendor }) => {
    return await models.Product.create({
      title: args.title,
      desc: args.desc,
      price: args.price,

      //reference the vendor's mongo id
      vendor: mongoose.Types.ObjectId(vendor.id),
    });
  },

  deleteProduct: async (parent, args, { models, vendor }) => {
    await models.Product.findById(args.id).remove();
    return true;
  },

  signUpVendor: async (
    parent,
    { username, email, password, tel, paybill },
    { models }
  ) => {
    //normalize the email address
    email = email.trim().toLowerCase();

    //hash the password
    const hashed = await bcrypt.hash(password, 10);

    try {
      const vendor = await models.Vendor.create({
        username,
        email,
        tel,
        paybill,
        password: hashed,
      });

      //create and return the json token
      return jwt.sign({ id: vendor._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      //if there's a prob creating an acc, throw an error
      throw new Error("Error creating account");
    }
  },

  signIn: async (parent, { email, username, password }, { models }) => {
    if (email) email = email.trim().toLowerCase();

    //Find the vendor using the username
    const vendor = await models.Vendor.findOne({ username });
    //if no vendor is found
    if (!vendor)
      throw new AuthenticationError(" No user with that username...");

    //if passwords don't match
    const valid = await bcrypt.compare(password, vendor.password);
    if (!valid) throw new AuthenticationError("Invalid password...");

    //if all checks out
    return jwt.sign({ id: vendor._id }, process.env.JWT_SECRET);
  },
};
