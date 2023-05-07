import gql from "graphql-tag";

export const typeDefs = gql`
  type Query {
    _root: Boolean
  }

  type Mutation {
    _root: Boolean
  }
`;
