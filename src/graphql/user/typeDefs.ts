import gql from "graphql-tag";

export const typeDefs = gql`
  type User implements FixitUser {
    id: ID!
    email: Email!
    phone: String!
    profile: Profile!
    stripeCustomerID: String!
    subscription: UserSubscription
    stripeConnectAccount: StripeConnectAccount
    createdAt: DateTime!
  }

  extend type Query {
    user: User!
  }
`;
