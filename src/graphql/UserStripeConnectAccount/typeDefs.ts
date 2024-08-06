export const typeDefs = `#graphql
  "A user's Stripe Connect Account details"
  type UserStripeConnectAccount {
    "(Immutable) The UserStripeConnectAccount's unique ID"
    id: ID!
    "Whether the user has submitted all required details to set up their Stripe Connect Account"
    detailsSubmitted: Boolean!
    "Whether the user's Stripe Connect Account is enabled for charges"
    chargesEnabled: Boolean!
    "Whether the user's Stripe Connect Account is enabled for payouts"
    payoutsEnabled: Boolean!
    "(Immutable) UserStripeConnectAccount creation timestamp"
    createdAt: DateTime!
    "Timestamp of the most recent UserStripeConnectAccount update"
    updatedAt: DateTime!
  }
`;
