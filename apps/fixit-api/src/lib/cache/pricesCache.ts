import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import Stripe from "stripe";
import { productsCache } from "@/lib/cache/productsCache.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import {
  SUBSCRIPTION_PRICE_NAMES as PRICE_NAMES,
  SUBSCRIPTION_PRODUCT_NAMES as PRODUCT_NAMES,
} from "@/models/UserSubscription/enumConstants.js";
import { InternalServerError } from "@/utils/httpErrors.js";
import { Cache } from "./Cache.js";
import type { SubscriptionPriceName } from "@/types/graphql.js";
import type { Entries } from "type-fest";

// Initialize the pricesCache with all active subscription prices:

const { data: activeSubscriptionPrices } = await stripe.prices.list({
  active: true,
  product: productsCache.get(PRODUCT_NAMES.FIXIT_SUBSCRIPTION)!.id,
});

// Ensure exactly 2 active subscription prices were returned from Stripe:
if (
  activeSubscriptionPrices.length !== 2 ||
  !activeSubscriptionPrices.every((price) =>
    ([PRICE_NAMES.ANNUAL, PRICE_NAMES.MONTHLY] as Array<string>).includes(price.nickname ?? "")
  )
) {
  throw new InternalServerError(
    "Unable to initialize pricesCache — Stripe did not return expected prices. " +
      safeJsonStringify(activeSubscriptionPrices)
  );
}

const pricesDictionary = activeSubscriptionPrices.reduce(
  (accum: Record<SubscriptionPriceName, Stripe.Price>, priceObject) => {
    const { nickname: priceName } = priceObject;
    accum[(priceName ?? "") as SubscriptionPriceName] = priceObject;
    // TRIAL uses the same priceID as MONTHLY:
    if (priceName === PRICE_NAMES.MONTHLY) accum.TRIAL = priceObject;
    return accum;
  },
  {
    ANNUAL: {} as Stripe.Price,
    MONTHLY: {} as Stripe.Price,
    TRIAL: {} as Stripe.Price,
  }
);

/**
 * API local cache for Stripe `Price` objects, keyed by `price.nickname`.
 */
export const pricesCache = new Cache<Stripe.Price, SubscriptionPriceName>(
  Object.entries(pricesDictionary) as Entries<typeof pricesDictionary>
);
