import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { stripe } from "@/lib/stripe";
import { InternalServerError } from "@/utils/httpErrors";
import { Cache } from "./Cache";
import type Stripe from "stripe";

/**
 * The `"Fixit Subscription"` Product `"name"`.
 */
export const FIXIT_SUBSCRIPTION_PRODUCT_NAME =
  "Fixit Subscription" as const satisfies Stripe.Product["name"];

export type ProductsCacheEntry = [typeof FIXIT_SUBSCRIPTION_PRODUCT_NAME, Stripe.Product];

// Initialize the productsCache with all active products:

const { data: activeProducts } = await stripe.products.list({ active: true });

const fixitSubscriptionProduct = activeProducts?.find(
  (prod) => prod.name === FIXIT_SUBSCRIPTION_PRODUCT_NAME
);

// Ensure the Fixit Subscription product was returned from Stripe:
if (!fixitSubscriptionProduct) {
  throw new InternalServerError(
    "Unable to initialize productsCache — Stripe did not return expected product. " +
      safeJsonStringify(activeProducts)
  );
}

/**
 * API local cache for Stripe `Product` objects, keyed by `product.name`.
 *
 * > Currently this only contains the `"Fixit Subscription"` Product object.
 */
export const productsCache = new Cache<Stripe.Product, typeof FIXIT_SUBSCRIPTION_PRODUCT_NAME>([
  [FIXIT_SUBSCRIPTION_PRODUCT_NAME, fixitSubscriptionProduct],
]);
