"use strict";
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cors = require("cors");

//get user info from a jwt
const getUser = (token) => {
  if (token) {
    try {
      //return the user information from the token
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      //problem with the token throw an error
      throw new Error("Session invalid");
    }
  }
};

const db = require("./db");
const models = require("./models");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

//Run the server info stored in our .env file
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);
app.use(cors());

//Connect to the DB
db.connect(DB_HOST);

//Apollo server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    //get the user token from the headers
    const token = req.headers.authorization;
    //try to retrieve a user with the token
    const user = getUser(token);
    //for now lets log the user to the console
    console.log(user);
    console.log(token);
    //Add the db models and user to the context
    return { models, user };
  },
});

//Apply the Apollo GraphQl middleware and set the path to /api
server.applyMiddleware({ app, path: "/api" });

// app.listen(port, () => console.log(`Running at port ${port}`));

app.listen({ port }, () =>
  console.log(`GraphQl at port: ${port} and path: ${server.graphqlPath}`)
);
