import gql from "graphql-tag";

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
