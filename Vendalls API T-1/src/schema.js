"use strict";

const { gql } = require("apollo-server-express");

module.exports = gql`
  type Query {
    products: [Product!]!
    product(id: ID!): Product!
    vendors: [Vendor!]!
    vendor(id: ID!): Vendor!
    users: [User!]!
    user(id: ID!): User!
  }

  type Mutation {
    signUpUser(email: String!, username: String!, password: String!): String!
    signUpVendor(
      email: String!
      username: String!
      password: String!
      tel: String!
      paybill: String!
    ): String!
    signInVendor(email: String, username: String, password: String!): String!
    signInUser(email: String, username: String, password: String!): String!
    createProduct(title: String!, desc: String!, price: Int!): Product!
    updateProduct(id: ID!, title: String, desc: String, price: Int): Product!
    deleteProduct(id: ID!): Boolean
    toggleFavourite(id: ID!): Product!
  }

  type Product {
    id: ID!
    title: String!
    desc: String!
    price: Int!
    vendor: Vendor!
    favouriteCount: Int!
    favouritedBy: [User!]
  }

  type User {
    id: ID!
    username: String!
    email: String!
    favourites: [Product!]!
  }

  type Vendor {
    id: ID!
    username: String!
    email: String!
    favourites: [Product!]!
    tel: String!
    paybill: String!
    products: [Product!]!
  }
`;
