import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type StripeConnectAccount {
    id: ID!
    detailsSubmitted: Boolean!
    chargesEnabled: Boolean!
    payoutsEnabled: Boolean!
  }
`;
