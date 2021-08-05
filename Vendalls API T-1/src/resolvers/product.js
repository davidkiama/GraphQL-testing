"use strict";

module.exports = {
  //Resolve the vendor info for a product when requested
  vendor: async (product, args, { models }) => {
    return await models.Vendor.findById(product.vendor);
  },

  //Resolved the favoriteBy info for a product when requested
  favouritedBy: async (product, args, { models }) => {
    return await models.User.find({ _id: { $in: product.favouritedBy } });
  },
};
