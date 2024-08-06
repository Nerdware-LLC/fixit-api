import { Cache } from "@/lib/cache/Cache.js";
import { mockStripeProduct } from "@/lib/stripe/__mocks__/_mockStripeProduct.js";
import { SUBSCRIPTION_PRODUCT_NAMES as PRODUCT_NAMES } from "@/models/UserSubscription/enumConstants.js";
import type Stripe from "stripe";

/**
 * API local cache for Stripe `Product` objects, keyed by `product.name`.
 *
 * > Currently this only contains the `"Fixit Subscription"` Product object.
 */
export const productsCache = new Cache<Stripe.Product, typeof PRODUCT_NAMES.FIXIT_SUBSCRIPTION>([
  [PRODUCT_NAMES.FIXIT_SUBSCRIPTION, mockStripeProduct({ name: PRODUCT_NAMES.FIXIT_SUBSCRIPTION })],
]);
