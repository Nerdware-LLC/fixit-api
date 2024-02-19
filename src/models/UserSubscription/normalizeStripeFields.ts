import { isString } from "@nerdware/ts-type-safety-utils";
import { unixToDate } from "@/utils/formatters/dateTime";
import type { StripeSubscriptionWithClientSecret } from "@/lib/stripe/types";
import type Stripe from "stripe";

/**
 * This function obtains app-relevant fields from the provided {@link Stripe.Subscription}
 * object and provide them in the returned object with normalized keys and values.
 *
 * > #### App fields obtained by this function:
 *
 * > | App Field          | App Field Type &emsp; | StripeSubscription Field      | StripeSubscription Field Type |
 *   | :----------------- | :-------------------- | :---------------------------- | :---------------------------- |
 *   | `stripeCustomerID` | `string`              | `customer`                    | `string`                      |
 *   | `createdAt`        | `Date`                | `created`                     | `number`                      |
 *   | `currentPeriodEnd` | `Date`                | `current_period_end`          | `number`                      |
 *   | `productID`        | `string`              | `items.data[0].price.product` | `string`                      |
 *   | `priceID`          | `string`              | `items.data[0].price.id`      | `string`                      |
 */
export const normalizeStripeFields = <
  StripeSub extends Stripe.Subscription | StripeSubscriptionWithClientSecret = Stripe.Subscription,
>(
  stripeSubObject: StripeSub
) => {
  // Destructure fields which are relevant to the app:
  const { customer, created, current_period_end, items } = stripeSubObject;

  // Ensure there's at least 1 subscription-item in the `items` array:
  if (!items.data[0]) {
    throw new Error("Stripe Subscription object has no items.");
  }

  // Get the `id` and related `product` of the `price` of the first sub-item:
  const { id: priceID, product } = items.data[0].price;

  // Obtain+normalize fields used in the app:
  const appFields = {
    stripeCustomerID: isString(customer) ? customer : customer.id,
    createdAt: unixToDate(created),
    currentPeriodEnd: unixToDate(current_period_end),
    productID: isString(product) ? product : product.id,
    priceID,
  };

  return {
    // The original Stripe Sub object is spread first so app-relevant fields take precedence
    ...stripeSubObject,
    ...appFields,
  };
};
