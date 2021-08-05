"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");
const { vendors } = require("./query");

async function prodVendorCheck(id, { models, account }, msg) {
  if (!account)
    throw new AuthenticationError(` Must be signed it to ${msg} products`);

  const product = await models.Product.findById(id);

  //check if prod id was created by the account passed in
  if (product && String(product.vendor) !== account.id) {
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
  { email, username, password, tel, paybill },
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

async function favouriteProduct({ id }, { models, account }) {
  if (!account) throw new AuthenticationError("Can't fav products");

  let prodCheck = await models.Product.findById(id);
  const hasAcc = prodCheck.favouritedBy.indexOf(account.id);

  //If the acc exist in the favourites list
  //pull them from the list and reduce the favoriteCount by one

  if (hasAcc >= 0) {
    return await models.Product.findByIdAndUpdate(
      id,
      {
        $pull: {
          favouritedBy: mongoose.Types.ObjectId(account.id),
        },
        $inc: {
          favouriteCount: -1,
        },
      },
      {
        new: true,
      }
    );
  } else {
    //If the acc does not exist in the favourites list
    //add them from the list and increment the favoriteCount by one
    return await models.Product.findByIdAndUpdate(
      id,
      {
        $push: {
          favouritedBy: mongoose.Types.ObjectId(account.id),
        },
        $inc: {
          favouriteCount: 1,
        },
      },
      {
        new: true,
      }
    );
  }
}

async function checkUserOrVendor({ models, account }) {
  //checks if acc passed is vendor or user
  if (await models.Vendor.findOne({ _id: account.id })) return "Vendor";
  if (await models.User.findOne({ _id: account.id })) return "User";
}

module.exports = {
  createProduct: async (parent, args, { models, account }) => {
    // Guard clause
    const acc = await checkUserOrVendor({ models, account });
    if (acc === "User") throw new AuthenticationError("Must be a vendor... ");

    return await models.Product.create({
      title: args.title,
      desc: args.desc,
      price: args.price,

      //reference the vendor's mongo id
      vendor: mongoose.Types.ObjectId(account.id),
    });
  },

  deleteProduct: async (parent, { id }, { models, account }) => {
    const product = await prodVendorCheck(id, { models, account }, "delete");

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
    { models, account }
  ) => {
    const product = await prodVendorCheck(id, { models, account }, "update");

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

  signUpVendor: async (parent, { ...vendorArgs }, { models }) => {
    return await signUp({ ...vendorArgs }, { models }, "Vendor");
  },

  signUpUser: async (parent, { ...userArgs }, { models }) => {
    return await signUp({ ...userArgs }, { models }, "User");
  },

  signInVendor: async (parent, { ...userArgs }, { models }) => {
    return await signIn({ ...userArgs }, { models }, "Vendor");
  },

  signInUser: async (parent, { ...userArgs }, { models }) => {
    return await signIn({ ...userArgs }, { models }, "User");
  },

  toggleFavourite: async (parent, { id }, { models, account }) => {
    // Guard clause
    const acc = await checkUserOrVendor({ models, account });
    if (acc === "Vendor")
      throw new AuthenticationError("Vendors can't fav products... ");

    return await favouriteProduct({ id }, { models, account });
  },
};
