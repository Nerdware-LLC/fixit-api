import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { stripe } from "@/lib/stripe";
import { InternalServerError } from "@/utils/httpErrors";
import { Cache } from "./Cache";
import { FIXIT_SUBSCRIPTION_PRODUCT_NAME, productsCache } from "./productsCache";
import type { OpenApiSchemas } from "@/types/open-api";
import type Stripe from "stripe";
import type { Entries } from "type-fest";

/** The names of Fixit Subscription prices: "TRIAL", "MONTHLY", "ANNUAL" */
type SubscriptionPriceLabels = OpenApiSchemas["SubscriptionPriceName"];

// Initialize the pricesCache with all active subscription prices:

const { data: activeSubscriptionPrices } = await stripe.prices.list({
  active: true,
  product: productsCache.get(FIXIT_SUBSCRIPTION_PRODUCT_NAME)!.id,
});

// Ensure exactly 2 active subscription prices were returned from Stripe:
if (
  activeSubscriptionPrices?.length !== 2 ||
  !activeSubscriptionPrices.every((price) => ["MONTHLY", "ANNUAL"].includes(`${price.nickname}`))
) {
  throw new InternalServerError(
    "Unable to initialize pricesCache — Stripe did not return expected prices. " +
      safeJsonStringify(activeSubscriptionPrices)
  );
}

const pricesDictionary = activeSubscriptionPrices.reduce(
  (accum, priceObject) => {
    const { nickname: priceName } = priceObject;
    accum[`${priceName}` as SubscriptionPriceLabels] = priceObject;
    // TRIAL uses the same priceID as MONTHLY:
    if (priceName === "MONTHLY") accum.TRIAL = priceObject;
    return accum;
  },
  { ANNUAL: {}, MONTHLY: {}, TRIAL: {} } as Record<SubscriptionPriceLabels, Stripe.Price>
);

/**
 * API local cache for Stripe `Price` objects, keyed by `price.nickname`.
 */
export const pricesCache = new Cache<Stripe.Price, SubscriptionPriceLabels>(
  Object.entries(pricesDictionary) as Entries<typeof pricesDictionary>
);
