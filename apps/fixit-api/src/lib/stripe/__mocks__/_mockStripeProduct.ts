import deepMerge from "lodash.merge";
import type Stripe from "stripe";

/**
 * Returns a mock Stripe Product object. Any provided args are deep-merged with
 * {@link DEFAULT_MOCK_STRIPE_PRODUCT_FIELDS|this default Product object}.
 *
 * @see https://stripe.com/docs/api/products/object
 */
export const mockStripeProduct = ({ ...productArgs }: Partial<Stripe.Product>): Stripe.Product => {
  /* deepMerge does NOT create a new obj, it updates+returns the first arg's
  ref, so the DEFAULT_ object must be spread here to avoid mutating it. */
  return deepMerge({ ...DEFAULT_MOCK_STRIPE_PRODUCT_FIELDS }, productArgs);
};

/**
 * Default mock Stripe Product object
 */
const DEFAULT_MOCK_STRIPE_PRODUCT_FIELDS: Stripe.Product = {
  id: "prod_TestTestTest",
  object: "product",
  active: true,
  created: 1678833149,
  default_price: null,
  description: "The payment app for people who need to get things done.",
  images: [],
  livemode: false,
  metadata: {},
  name: "Fixit Subscription",
  package_dimensions: null,
  shippable: null,
  statement_descriptor: "FIXIT_SUBSCRIPTION",
  tax_code: null,
  unit_label: null,
  updated: 1678833149,
  url: null,
  attributes: [],
  type: "service",
};
