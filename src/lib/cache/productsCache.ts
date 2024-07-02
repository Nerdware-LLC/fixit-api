import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { SUBSCRIPTION_PRODUCT_NAMES as PRODUCT_NAMES } from "@/models/UserSubscription/enumConstants.js";
import { InternalServerError } from "@/utils/httpErrors.js";
import { Cache } from "./Cache.js";
import type Stripe from "stripe";

// Initialize the productsCache with all active products:
const { data: activeProducts } = await stripe.products.list({ active: true });

const fixitSubscriptionProduct = activeProducts.find(
  (prod) => prod.name === PRODUCT_NAMES.FIXIT_SUBSCRIPTION
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
 */
export const productsCache = new Cache<Stripe.Product, typeof PRODUCT_NAMES.FIXIT_SUBSCRIPTION>([
  [PRODUCT_NAMES.FIXIT_SUBSCRIPTION, fixitSubscriptionProduct],
]);
