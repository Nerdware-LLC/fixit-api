import gql from "graphql-tag";

export const typeDefs = gql`
  type StripeConnectAccount {
    id: ID!
    detailsSubmitted: Boolean!
    chargesEnabled: Boolean!
    payoutsEnabled: Boolean!
  }
`;
