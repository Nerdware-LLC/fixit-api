import type { UserType, UserSubscriptionType } from "@types";
import type Stripe from "stripe";

/**
 * This function takes an object in the shape returned by the Stripe API
 * and normalizes the keys+values used by the DynamoDB table. Note that
 * fields NOT used by the DynamoDB schema are NOT modified - for example,
 * `obj.latest_invoice` will remain `obj.latest_invoice`.
 */
export const normalizeStripeFields = ({
  customer,
  created,
  current_period_end,
  items,
  ...rest
}: Stripe.Subscription) => {
  return {
    stripeCustomerID: customer,
    createdAt: new Date(created * 1000),
    currentPeriodEnd: new Date(current_period_end * 1000),
    productID: items.data[0].price.product,
    priceID: items.data[0].price.id,
    ...rest,
  } as Omit<UserSubscriptionType, "updatedAt"> &
    Pick<UserType, "stripeCustomerID"> &
    Omit<
      Stripe.Response<Stripe.Subscription>,
      "customer" | "created" | "current_period_end" | "items" | "lastResponse"
    >;
};
