import deepMerge from "lodash.merge";
import { MOCK_DATE_UNIX_TIMESTAMPS } from "@/tests/staticMockItems/dates";
import type Stripe from "stripe";
import type { PartialDeep } from "type-fest";

/**
 * Returns a mock Stripe Price object. Any provided args are deep-merged with
 * {@link DEFAULT_MOCK_STRIPE_PRICE_FIELDS|this default Price object}.
 *
 * @see https://stripe.com/docs/api/prices/object
 */
export const mockStripePrice = ({ ...priceArgs }: PartialDeep<Stripe.Price>) => {
  return deepMerge({ ...DEFAULT_MOCK_STRIPE_PRICE_FIELDS }, priceArgs);
};

/**
 * Default mock Stripe Price object
 */
const DEFAULT_MOCK_STRIPE_PRICE_FIELDS: Stripe.Price = {
  object: "price",
  id: "price_TestANNUAL",
  active: true,
  billing_scheme: "per_unit",
  created: MOCK_DATE_UNIX_TIMESTAMPS.JAN_1_2020,
  currency: "usd",
  custom_unit_amount: null,
  livemode: false,
  lookup_key: null,
  metadata: {},
  nickname: "ANNUAL",
  product: "prod_TestTestTest",
  recurring: {
    aggregate_usage: null,
    interval: "month",
    interval_count: 1,
    trial_period_days: null,
    usage_type: "licensed",
  },
  tax_behavior: "unspecified",
  tiers_mode: null,
  transform_quantity: null,
  type: "recurring",
  unit_amount: 500,
  unit_amount_decimal: "500",
};
