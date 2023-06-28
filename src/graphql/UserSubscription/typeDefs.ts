import { gql } from "graphql-tag";

export const typeDefs = gql`
  type UserSubscription {
    id: ID!
    currentPeriodEnd: DateTime!
    productID: String!
    priceID: String!
    status: SubscriptionStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum SubscriptionStatus {
    active
    incomplete
    incomplete_expired
    trialing
    past_due
    canceled
    unpaid
  }

  enum SubscriptionPriceLabel {
    ANNUAL
    MONTHLY
    TRIAL
  }

  extend type Query {
    mySubscription: UserSubscription!
  }
`;
