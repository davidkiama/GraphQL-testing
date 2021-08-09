"use strict";
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const depthLimit = require("graphql-depth-limit");
const { createComplexityLimitRule } = require("graphql-validation-complexity");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cors = require("cors");

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
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);
app.use(cors());

//
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: async ({ req }) => {
    //get the token from the headers
    const token = req.headers.authorization;
    //get the vendor using the token
    const account = await getAccount(token);

    return { models, account };
  },
});

server.applyMiddleware({ app, path: "/api" });

app.listen({ port }, () => {
  console.log(`GraphQL at port ${port} and path ${server.graphqlPath}`);
});
