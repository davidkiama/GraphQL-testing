"use strict";
const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar DateTime
  type Query {
    products: [Product!]!
    product(id: ID!): Product!
    user(username: String!): User
    users: [User!]!
    me: User!
    productFeed(cursor: String): ProductFeed
  }

  type Mutation {
    newProduct(title: String!): Product!
    updateProduct(id: ID!, title: String!): Product!
    deleteProduct(id: ID!): Boolean
    signUp(username: String!, email: String!, password: String!): String!
    signIn(username: String, email: String, password: String!): String!
    toggleFavorite(id: ID!): Product!
  }

  type Product {
    id: ID!
    title: String!
    vendor: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    favoriteCount: Int!
    favoritedBy: [User!]
  }

  type ProductFeed {
    products: [Product]!
    cursor: String!
    hasNextPage: Boolean
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    products: [Product!]!
    favorites: [Product!]!
  }
`;
