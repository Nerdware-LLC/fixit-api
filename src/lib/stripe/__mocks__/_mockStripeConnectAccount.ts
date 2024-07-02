import dayjs from "dayjs";
import type { UserItem } from "@/models/User";
import type { UserStripeConnectAccountItem } from "@/models/UserStripeConnectAccount";
import type Stripe from "stripe";

/**
 * Returns a mock Stripe Connect Account object.
 * @see https://stripe.com/docs/api/accounts/object
 */
export const mockStripeConnectAccount = ({
  // SCA fields:
  id: stripeConnectAccountID,
  chargesEnabled,
  payoutsEnabled,
  detailsSubmitted,
  createdAt,
  // optional User fields:
  email = "mock_user_email@gmail.com",
  phone = "1234567890",
  profile = { displayName: "Mock User" },
}: UserStripeConnectAccountItem &
  Partial<Pick<UserItem, "email" | "phone" | "profile">>): Stripe.Account => ({
  object: "account",
  type: "express",
  id: stripeConnectAccountID,
  charges_enabled: chargesEnabled,
  details_submitted: payoutsEnabled,
  payouts_enabled: detailsSubmitted,
  email,
  created: dayjs(createdAt).unix(),
  country: "US",
  default_currency: "usd",
  capabilities: { card_payments: "active", transfers: "active" },
  // The fields below are not currently used by the app, but are included here for completeness.
  business_profile: {
    mcc: null,
    name: profile.businessName ?? null,
    product_description: null,
    support_address: null,
    support_email: email,
    support_phone: phone,
    support_url: null,
    url: null,
  },
  external_accounts: {
    object: "list",
    data: [],
    has_more: false,
    url: `/v1/accounts/${stripeConnectAccountID}/external_accounts`,
  },
  future_requirements: {
    alternatives: [],
    current_deadline: null,
    currently_due: [],
    disabled_reason: null,
    errors: [],
    eventually_due: [],
    past_due: [],
    pending_verification: [],
  },
  metadata: {},
  requirements: {
    alternatives: [],
    current_deadline: null,
    currently_due: [],
    disabled_reason: null,
    errors: [],
    eventually_due: [],
    past_due: [],
    pending_verification: [],
  },
  settings: {
    bacs_debit_payments: {},
    branding: {
      icon: null,
      logo: null,
      primary_color: null,
      secondary_color: null,
    },
    card_issuing: { tos_acceptance: { date: null, ip: null } },
    card_payments: {
      decline_on: { avs_failure: true, cvc_failure: false },
      statement_descriptor_prefix: null,
      statement_descriptor_prefix_kanji: null,
      statement_descriptor_prefix_kana: null,
    },
    dashboard: { display_name: profile.displayName, timezone: "US/Pacific" },
    payments: {
      statement_descriptor: null,
      statement_descriptor_kana: null,
      statement_descriptor_kanji: null,
      statement_descriptor_prefix_kana: null,
      statement_descriptor_prefix_kanji: null,
    },
    payouts: {
      debit_negative_balances: true,
      schedule: { delay_days: 7, interval: "daily" },
      statement_descriptor: null,
    },
    sepa_debit_payments: {},
  },
  tos_acceptance: {
    date: null,
    ip: null,
    user_agent: null,
  },
});
