import { Cache } from "@/lib/cache/Cache.js";
import { mockStripePrice } from "@/lib/stripe/__mocks__/_mockStripePrice.js";
import {
  SUBSCRIPTION_ENUMS,
  SUBSCRIPTION_PRICE_NAMES as PRICE_NAMES,
} from "@/models/UserSubscription/enumConstants.js";
import type { SubscriptionPriceName } from "@/types/graphql.js";
import type Stripe from "stripe";

/**
 * ### Mock Prices Cache
 */
export const pricesCache = new Cache<Stripe.Price, SubscriptionPriceName>(
  SUBSCRIPTION_ENUMS.PRICE_NAMES.map((priceName) => [
    priceName,
    mockStripePrice({
      id: `price_Test${priceName}`,
      nickname: priceName,
      ...(priceName === PRICE_NAMES.TRIAL && {
        recurring: { trial_period_days: 14 },
      }),
    }),
  ])
);
