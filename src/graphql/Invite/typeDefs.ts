import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Mutation {
    createInvite(phoneOrEmail: String!): GenericSuccessResponse!
  }
`;
