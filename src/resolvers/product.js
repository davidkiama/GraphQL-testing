"use strict";

module.exports = {
  //Resolve the vendor info for a product when requested
  vendor: async (product, args, { models }) => {
    return await models.User.findById(product.vendor);
  },

  //Resolved the favoriteBy info for a product when requested
  favoritedBy: async (product, args, { models }) => {
    return await models.User.find({ _id: { $in: product.favoritedBy } });
  },
};
