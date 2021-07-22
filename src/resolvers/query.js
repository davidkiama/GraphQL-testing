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

  productFeed: async (parent, { cursor }, { models }) => {
    //limit to 10 users
    const limit = 10;
    //set the default hasNextPage value to false
    let hasNextPage = false;
    //if no cursor is passed the default query will be empty
    //this will pull the newest products from the db

    let cursorQuery = {};

    //if there is a cursor we look for products with
    //ObjectId less than that of the cursor
    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }
    //Fetch for products +1 that fit the condition and sort newest to oldest
    let products = await models.Product.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    //If products found exceed our limit we trim the list
    //and set hasNextPage to true
    if (products.length > limit) {
      hasNextPage = true;
      products = products.slice(0, -1);
    }

    //new cursor will the last item in the list
    const newCursor = products[products.length - 1]._id;

    return {
      products,
      cursor: newCursor,
      hasNextPage,
    };
  },
};
