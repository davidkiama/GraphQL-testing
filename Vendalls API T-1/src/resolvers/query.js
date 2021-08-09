"use strict";

async function checkUserOrVendor({ models, account }) {
  //checks if acc passed is vendor or user
  if (await models.Vendor.findOne({ _id: account.id })) return "Vendor";
  if (await models.User.findOne({ _id: account.id })) return "User";
}

module.exports = {
  products: async (parent, args, { models }) => {
    return await models.Product.find().limit(100);
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

  me: async (parent, args, { models, account }) => {
    const acc = await checkUserOrVendor({ models, account });
    return await models[acc].findById(account.id);
  },

  productFeed: async (parent, { cursor }, { models }) => {
    //lets hardcode the limit to the 10 items
    const limit = 10;
    //set 'hasNextPage' default value to false
    let hasNextPage = false;
    //if no cursor is passed the deault query will be empty and
    //this will pull the newest products from the DB
    let cursorQuery = {};
    //if there is a cursor our query will look
    //for products with an ObjectId less than that of the cursor
    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }
    //find the limit +1 of products in our DB, sorted newest to oldest
    let products = await models.Product.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    //if the number of products we find exceeds our limit
    //set hasNextPage to true and trim our product limit
    if (products.length > limit) {
      hasNextPage = true;
      products = products.slice(0, -1);
    }

    // the new cursor will be the Mongo Object Id of the last item
    const newCursor = products[products.length - 1]._id;

    console.log("TTTTT");
    return {
      products,
      cursor: newCursor,
      hasNextPage,
    };
  },
};
