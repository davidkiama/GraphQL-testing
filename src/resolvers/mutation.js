"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");

const gravatar = require("../util/gravatar");

module.exports = {
  newProduct: async (parent, args, { models, user }) => {
    //if there is no user on the context, throw an auth error
    if (!user) {
      throw new AuthenticationError("Must be signed in to create a product");
    }

    return await models.Product.create({
      title: args.title,
      //reference the vendor's mongo id
      vendor: mongoose.Types.ObjectId(user.id),
    });
  },

  deleteProduct: async (parent, { id }, { models, user }) => {
    //if there is no user on the context, throw an auth error
    if (!user) {
      throw new AuthenticationError("Must be signed in to delete a product");
    }

    //find the product
    const product = await models.Product.findById(id);

    //if the product owner and current user user don't match, throw a forbidden error
    //Optional chaining &&
    if (product && String(product.vendor) !== user.id) {
      throw new ForbiddenError(
        "You don't have permissions to delete the product"
      );
    }

    try {
      //if everything checks out, remove the note
      await product.remove();
      return true;
    } catch (err) {
      //If there is an error along the way, return false
      return false;
    }
  },

  updateProduct: async (parent, { title, id }, { models, user }) => {
    //if there is no user on the context, throw an auth error
    if (!user) {
      throw new AuthenticationError("Must be signed in to delete a product");
    }

    //find the product
    const product = await models.Product.findById(id);

    //if the product owner and current user user don't match, throw a forbidden error
    //Optional chaining &&
    if (product && String(product.vendor) !== user.id) {
      throw new ForbiddenError(
        "You don't have permissions to update the product"
      );
    }

    //updated the product in the DB and retun the updated product
    return await models.Product.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          title,
        },
      },
      {
        new: true,
      }
    );
  },

  signUp: async (parent, { username, email, password }, { models }) => {
    //normalize email address
    email = email.trim().toLowerCase();
    //hash the passsword
    const hashed = await bcrypt.hash(password, 10);
    //create the gravatar Url
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });

      //create and return the json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      //if there's a prob creating an acc, throw an error
      throw new Error("Error creating account");
    }
  },

  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      //normalize email address
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });

    //if no user is found, throw an auth error
    if (!user) {
      throw new AuthenticationError("Error signing in...");
    }

    //if passwords don't match throw an auth error
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError("Wrong password mate");
    }

    //create and return the json web token
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },

  toggleFavorite: async (parent, { id }, { models, user }) => {
    //if no user context is passed, throw uth error
    if (!user) {
      throw new AuthenticationError("Can't Favorite products");
    }

    //check if the user has already favorited the product
    let prodCheck = await models.Product.findById(id);
    const hasUser = prodCheck.favoritedBy.indexOf(user.id);

    //If the user exist in the list
    //pull them from the list and reduce the favoriteCount by one
    if (hasUser >= 0) {
      return await models.Product.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          //set new to true and update the docu
          new: true,
        }
      );
    } else {
      //if user doesn't exist in the list
      //add them to the list and increment the favoriteCount by 1
      return await models.Product.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: 1,
          },
        },
        {
          new: true,
        }
      );
    }
  },
};
