import type Stripe from "stripe";

/**
 * This function takes an object in the shape returned by the Stripe API
 * and normalizes the keys+values used by the DynamoDB table. Note that
 * fields NOT used by the DynamoDB schema are NOT modified - for example,
 * `obj.latest_invoice` will remain `obj.latest_invoice`.
 *
 * > ⚠️ This fn currently makes assumptions about expanded fields. For example,
 * > it assumes that `customer` is a string, rather than a `Stripe.Customer`
 * > or `Stripe.DeletedCustomer` object.
 */
export const normalizeStripeFields = ({
  customer,
  created,
  current_period_end,
  items,
  ...rest
}: Stripe.Subscription) => {
  return {
    stripeCustomerID: customer as string,
    createdAt: new Date(created * 1000),
    currentPeriodEnd: new Date(current_period_end * 1000),
    productID: items.data[0].price.product as string,
    priceID: items.data[0].price.id,
    ...rest,
  };
};
