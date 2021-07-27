"use strict";

module.exports = {
  vendor: async (product, args, { models }) => {
    return await models.Vendor.findById(product.vendor);
  },
};
