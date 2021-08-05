"use strict";
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();

const jwt = require("jsonwebtoken");

//get vendor info from the webtoken
const getAccount = (token) => {
  if (token) {
    try {
      // return vendor info from the token
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      throw new Error("Session invalid...");
    }
  }
};

//
const db = require("./db");
const models = require("./models");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

//
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

//
db.connect(DB_HOST);

//
const app = express();

//
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    //get the token from the headers
    const token = req.headers.authorization;
    //get the vendor using the token
    const account = getAccount(token);

    //lets log the vendor
    // console.log(vendor);

    return { models, account };
  },
});

server.applyMiddleware({ app, path: "/api" });

app.listen({ port }, () => {
  console.log(`GraphQL at port ${port} and path ${server.graphqlPath}`);
});
