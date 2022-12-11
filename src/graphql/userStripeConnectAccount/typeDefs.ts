import gql from "graphql-tag";

export const typeDefs = gql`
  type UserStripeConnectAccount {
    id: ID!
    detailsSubmitted: Boolean!
    chargesEnabled: Boolean!
    payoutsEnabled: Boolean!
  }
`;
