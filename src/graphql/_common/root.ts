import { gql } from "apollo-server-express";

export const root = {
  typeDefs: gql`
    type Query {
      _root: Boolean
    }

    type Mutation {
      _root: Boolean
    }
  `
};
