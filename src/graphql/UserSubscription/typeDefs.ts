export const typeDefs = `#graphql
  "A user's subscription to a Fixit SaaS product"
  type UserSubscription {
    "(Immutable) The UserSubscription's unique ID"
    id: ID!
    "The timestamp indicating when the current UserSubscription period ends"
    currentPeriodEnd: DateTime!
    "The UserSubscription's product ID, as provided by Stripe"
    productID: String!
    "The UserSubscription's price ID, as provided by Stripe"
    priceID: String!
    "The UserSubscription's status, as provided by Stripe"
    status: SubscriptionStatus!
    "(Immutable) UserSubscription creation timestamp"
    createdAt: DateTime!
    "Timestamp of the most recent UserSubscription update"
    updatedAt: DateTime!
  }

  """
  The status of a User's Subscription, as provided by Stripe.
  See https://docs.stripe.com/api/subscriptions/object#subscription_object-status
  """
  enum SubscriptionStatus {
    "The subscription is active and the user has access to the product"
    active
    "The subscription is incomplete and has not yet expired"
    incomplete
    "The subscription is incomplete and has expired"
    incomplete_expired
    "The subscription is in a limited trial phase and has access to the product"
    trialing
    "The subscription is past due and the user has lost access to the product"
    past_due
    "The subscription is canceled and the user has lost access to the product"
    canceled
    "The subscription is unpaid and the user has lost access to the product"
    unpaid
  }

  "Names of the currently available Fixit subscription price-models"
  enum SubscriptionPriceName {
    "The annual subscription price model"
    ANNUAL
    "The monthly subscription price model"
    MONTHLY
    "The trial subscription price model"
    TRIAL
  }

  extend type Query {
    mySubscription: UserSubscription!
  }
`;
