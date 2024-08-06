export const typeDefs = `#graphql
  extend type Mutation {
    createInvite(phoneOrEmail: String!): MutationResponse!
  }
`;
