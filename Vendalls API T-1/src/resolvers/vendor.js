"use strict";

module.exports = {
  //Resolve the list of products for a vendor when requested
  products: async (vendor, args, { models }) => {
    return await models.Product.find({ vendor: vendor._id }).sort({ _id: -1 });
  },
  //Resolve the list of favorites for a vendor when requested
  favourites: async (vendor, args, { models }) => {
    return await models.Product.find({ favoritedBy: vendor._id }).sort({
      _id: -1,
    });
  },
};
