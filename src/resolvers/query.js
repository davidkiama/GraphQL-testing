"use strict";

module.exports = {
  products: async (parent, args, { models }) => {
    return await models.Product.find();
  },
  product: async (parent, args, { models }) => {
    return await models.Product.findById(args.id);
  },
  user: async (parent, { username }, { models }) => {
    //find user given the username
    return await models.User.findOne({ username });
  },
  users: async (parent, args, { models }) => {
    //find all users
    return await models.User.find({});
  },
  me: async (parent, args, { models, user }) => {
    //find the user given the current user context
    return await models.User.findById(user.id);
  },
};
