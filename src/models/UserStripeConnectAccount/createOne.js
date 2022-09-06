import { stripe } from "@lib/stripe";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function ({ userID, email, phone, profile }) {
  /* Create UserStripeConnectAccount related Items in this order:

    stripeConnectAccount        (Stripe)
    UserStripeConnectAccount    (DynamoDB)  Needs stripeConnectAccountID
  */

  // Create Stripe Connect Account via Stripe API
  const {
    id: stripeConnectAccountID,
    details_submitted: detailsSubmitted,
    charges_enabled: chargesEnabled,
    payouts_enabled: payoutsEnabled
  } = await stripe.accounts.create({
    type: "express",
    country: "US",
    default_currency: "USD",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    },
    business_type: "individual",
    company: {
      ...(profile?.businessName && { name: profile.businessName }),
      phone
    },
    individual: {
      email,
      ...(profile?.givenName && { first_name: profile.givenName }),
      ...(profile?.familyName && { last_name: profile.familyName }),
      phone
    },
    business_profile: {
      ...(profile?.businessName && { name: profile.businessName }),
      support_email: email,
      support_phone: phone
    },
    tos_acceptance: {
      service_agreement: "full"
    },
    settings: {
      payouts: {
        debit_negative_balances: true
      }
    }
  });

  // Create UserStripeConnectAccount in DynamoDB
  const newUserStripeConnectAccount = await this.create({
    pk: userID,
    sk: `STRIPE_CONNECT_ACCOUNT#${userID}`,
    data: stripeConnectAccountID,
    detailsSubmitted,
    chargesEnabled,
    payoutsEnabled
  });

  return newUserStripeConnectAccount;
};
