import { MOCK_DATE_UNIX_TIMESTAMPS } from "@/tests/staticMockItems/dates.js";
import type Stripe from "stripe";

/**
 * Default mock Stripe Plan object.
 * @see https://stripe.com/docs/api/plans/object
 */
export const MOCK_STRIPE_PLAN: Stripe.Plan = {
  object: "plan",
  id: "price_TestANNUAL",
  active: true,
  aggregate_usage: null,
  amount: 500,
  amount_decimal: "500",
  billing_scheme: "per_unit",
  created: MOCK_DATE_UNIX_TIMESTAMPS.JAN_1_2020,
  currency: "usd",
  interval: "month",
  interval_count: 1,
  livemode: false,
  metadata: {},
  nickname: null,
  product: "prod_TestTestTest",
  tiers_mode: null,
  transform_usage: null,
  trial_period_days: null,
  usage_type: "licensed",
};
