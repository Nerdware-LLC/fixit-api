export const typeDefs = `#graphql
  type UserStripeConnectAccount {
    id: ID!
    detailsSubmitted: Boolean!
    chargesEnabled: Boolean!
    payoutsEnabled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;
