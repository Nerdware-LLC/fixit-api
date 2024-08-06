import deepMerge from "lodash.merge";
import type Stripe from "stripe";
import type { PartialDeep } from "type-fest";

/**
 * Returns a mock Stripe PromotionCode object. Any provided args are deep-merged with
 * {@link DEFAULT_MOCK_PROMO_CODE_FIELDS|this default PromotionCode object}.
 *
 * @see https://stripe.com/docs/api/promotion_codes/object
 */
export const mockStripePromotionCode = ({
  ...promoCodeArgs
}: PartialDeep<Stripe.PromotionCode>): Stripe.PromotionCode => {
  /* deepMerge does NOT create a new obj, it updates+returns the first arg's
  ref, so the DEFAULT_ object must be spread here to avoid mutating it. */
  return deepMerge({ ...DEFAULT_MOCK_PROMO_CODE_FIELDS }, promoCodeArgs);
};

/**
 * Default mock PromotionCode object
 */
const DEFAULT_MOCK_PROMO_CODE_FIELDS: Stripe.PromotionCode = {
  id: "promo_TestTestTest",
  object: "promotion_code",
  active: true,
  code: "TESTPROMO",
  coupon: {
    id: "nVJYDOag",
    object: "coupon",
    amount_off: null,
    created: 1678040164,
    currency: "usd",
    duration: "repeating",
    duration_in_months: 3,
    livemode: false,
    max_redemptions: null,
    metadata: {},
    name: null,
    percent_off: 10,
    redeem_by: null,
    times_redeemed: 0,
    valid: true,
  },
  created: 1678040164,
  customer: null,
  expires_at: null,
  livemode: false,
  max_redemptions: null,
  metadata: {},
  restrictions: {
    first_time_transaction: false,
    minimum_amount: null,
    minimum_amount_currency: null,
  },
  times_redeemed: 0,
};
