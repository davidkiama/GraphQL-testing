"use strict";

const Query = require("./query");
const Mutation = require("./mutation");
const Product = require("./product");
const User = require("./user");
const { GraphQLDateTime } = require("graphql-iso-date");

module.exports = {
  Query,
  Mutation,
  Product,
  User,
  DateTime: GraphQLDateTime,
};
