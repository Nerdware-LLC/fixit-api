import { stripe } from "@lib/stripe";
import type { Model } from "@lib/dynamoDB";
import type { UserType, UserStripeConnectAccountAllFields } from "@types";

// function, not arrow, bc we need "this" to be the UserStripeConnectAccount model
export const createOne = async function (
  this: InstanceType<typeof Model>,
  {
    userID,
    email,
    phone,
    profile,
  }: {
    userID: UserType["id"];
    email: UserType["email"];
    phone: UserType["phone"];
    profile?: UserType["profile"];
  }
): Promise<UserStripeConnectAccountAllFields> {
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
