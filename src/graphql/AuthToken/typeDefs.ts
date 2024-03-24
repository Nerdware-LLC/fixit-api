import { gql } from "graphql-tag";

export const typeDefs = gql`
  type AuthTokenPayload {
    id: ID!
    handle: String!
    email: String!
    phone: String
    profile: Profile!
    stripeCustomerID: String!
    subscription: AuthTokenPayloadSubscriptionInfo
    stripeConnectAccount: AuthTokenPayloadStripeConnectAccountInfo
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthTokenPayloadSubscriptionInfo {
    id: ID!
    status: SubscriptionStatus!
    currentPeriodEnd: DateTime!
  }

  type AuthTokenPayloadStripeConnectAccountInfo {
    id: ID!
    detailsSubmitted: Boolean!
    chargesEnabled: Boolean!
    payoutsEnabled: Boolean!
  }
`;
