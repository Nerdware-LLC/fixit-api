import { stripe } from "@/lib/stripe/stripeClient.js";
import {
  UserStripeConnectAccount,
  type UserStripeConnectAccountItem,
} from "@/models/UserStripeConnectAccount/UserStripeConnectAccount.js";
import type { UserItem } from "@/models/User/User.js";

/**
 * This method creates a `UserStripeConnectAccount` item in both the Fixit database
 * and Stripe's API (via `stripe.accounts.create`).
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
      ...(phone && { phone }),
      ...(profile?.businessName && { name: profile.businessName }),
    },
    individual: {
      email,
      ...(phone && { phone }),
      ...(profile?.givenName && { first_name: profile.givenName }),
      ...(profile?.familyName && { last_name: profile.familyName }),
    },
    business_profile: {
      support_email: email,
      ...(phone && { support_phone: phone }),
      ...(profile?.businessName && { name: profile.businessName }),
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
