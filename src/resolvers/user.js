"use strict";

module.exports = {
  //Resolve the list of products for a user when requested
  products: async (user, args, { models }) => {
    return await models.Product.find({ vendor: user._id }).sort({ _id: -1 });
  },
  //Resolve the list of favorites for a user when requested
  favorites: async (user, args, { models }) => {
    return await models.Product.find({ favoritedBy: user._id }).sort({
      _id: -1,
    });
  },
};
