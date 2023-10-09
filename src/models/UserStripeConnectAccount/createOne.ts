import { stripe } from "@/lib/stripe";
import {
  UserStripeConnectAccount,
  type UserStripeConnectAccountItem,
} from "@/models/UserStripeConnectAccount";
import type { UserItem } from "@/models/User";

/**
 * This method creates a `UserStripeConnectAccount` item in both the DB and
 * Stripe's API (via `stripe.accounts.create`).
 *
 * Note: this function does not use arrow syntax because `this` is the
 * UserStripeConnectAccount Model.
 */
export const createOne = async function (
  this: typeof UserStripeConnectAccount,
  {
    userID,
    email,
    phone,
    profile,
  }: {
    userID: UserItem["id"];
    email: UserItem["email"];
    phone: UserItem["phone"];
    profile?: UserItem["profile"];
  }
): Promise<Required<UserStripeConnectAccountItem>> {
  // Create Stripe Connect Account via Stripe API
  const {
    id: stripeConnectAccountID,
    details_submitted: detailsSubmitted,
    charges_enabled: chargesEnabled,
    payouts_enabled: payoutsEnabled,
  } = await stripe.accounts.create({
    type: "express",
    country: "US",
    default_currency: "USD",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    company: {
      ...(profile?.businessName && { name: profile.businessName }),
      phone,
    },
    individual: {
      email,
      phone,
      ...(profile?.givenName && { first_name: profile.givenName }),
      ...(profile?.familyName && { last_name: profile.familyName }),
    },
    business_profile: {
      ...(profile?.businessName && { name: profile.businessName }),
      support_email: email,
      support_phone: phone,
    },
    tos_acceptance: {
      service_agreement: "full",
    },
    settings: {
      payouts: {
        debit_negative_balances: true,
      },
    },
  });

  // Create UserStripeConnectAccount in DynamoDB
  return await this.createItem({
    userID,
    id: stripeConnectAccountID,
    detailsSubmitted,
    chargesEnabled,
    payoutsEnabled,
  });
};
