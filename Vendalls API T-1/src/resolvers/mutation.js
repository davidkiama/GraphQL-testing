"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");

async function prodVendorCheck(id, { models, vendor }, msg) {
  if (!vendor)
    throw new AuthenticationError(` Must be signed it to ${msg} products`);

  const product = await models.Product.findById(id);

  //check if prod id was created by the vendor
  if (product && String(product.vendor) !== vendor.id) {
    throw new ForbiddenError(`Not allowed to ${msg} this product`);
  }

  return await product;
}

async function signIn({ email, username, password }, { models }, Account) {
  if (email) email = email.trim().toLowerCase();

  //Find the account using the username or email
  const acc = await models[Account].findOne({
    $or: [{ username }, { email }],
  });

  //if no acc is found
  if (!acc)
    throw new AuthenticationError(`No ${Account} with that username/email...`);

  //if passwords don't match
  const valid = await bcrypt.compare(password, acc.password);
  if (!valid) throw new AuthenticationError("Invalid password...");

  //if all checks out
  return jwt.sign({ id: acc._id }, process.env.JWT_SECRET);
}

async function signUp(
  { username, email, password, tel, paybill },
  { models },
  Account
) {
  //normalize the email
  email = email.trim().toLowerCase();

  //hash the password
  const hashed = await bcrypt.hash(password, 10);

  try {
    if (Account.includes("Vendor")) {
      var acc = await models.Vendor.create({
        username,
        email,
        tel,
        paybill,
        password: hashed,
      });
    } else if (Account.includes("User")) {
      var acc = await models.User.create({
        username,
        email,
        password: hashed,
      });
    }

    //create and return the json token
    return jwt.sign({ id: acc._id }, process.env.JWT_SECRET);
  } catch (err) {
    //if there's a prob creating an acc, throw an error
    throw new Error("Error creating account");
  }
}

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

  deleteProduct: async (parent, { id }, { models, vendor }) => {
    const product = await prodVendorCheck(id, { models, vendor }, "delete");

    try {
      await product.remove();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  updateProduct: async (
    parent,
    { id, title, desc, price },
    { models, vendor }
  ) => {
    const product = await prodVendorCheck(id, { models, vendor }, "update");

    //update the product in the DB and return it
    return await models.Product.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          title: title || product.title,
          desc: desc || product.desc,
          price: price || product.price,
        },
      },
      {
        new: false,
      }
    );
  },

  signUpVendor: async (
    parent,
    { username, email, password, tel, paybill },
    { models }
  ) => {
    return await signUp(
      { username, email, password, tel, paybill },
      { models },
      "Vendor"
    );
  },

  signInVendor: async (parent, { email, username, password }, { models }) => {
    return await signIn({ email, username, password }, { models }, "Vendor");
  },
};
