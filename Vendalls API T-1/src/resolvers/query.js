"use strict";

module.exports = {
  products: async (parent, args, { models }) => {
    return await models.Product.find();
  },
  product: async (parent, args, { models }) => {
    return await models.Product.findById(args.id);
  },

  vendors: async (parent, args, { models }) => {
    return await models.Vendor.find({});
  },
  vendor: async (parent, args, { models }) => {
    return await models.Vendor.findById(args.id);
  },

  users: async (parent, args, { models }) => {
    return await models.User.find({});
  },

  user: async (parent, args, { models }) => {
    return await models.User.findById(args.id);
  },
};
