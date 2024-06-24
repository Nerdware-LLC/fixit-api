import { capitalize } from "@/utils/formatters/strings.js";
import type Stripe from "stripe";

/**
 * Attempts to extract a `client_secret` from a Stripe API object.
 *
 * > **Supported Objects**: {@link Stripe.Subscription}, {@link Stripe.PaymentIntent}
 *
 * This function looks for a `client_secret` using the following object paths:
 *
 * 1. `[obj].client_secret`
 * 2. `[obj].latest_invoice.payment_intent.client_secret`
 *
 * If `client_secret` is found at any of these paths, it is returned, else an error is thrown.
 */
export const extractClientSecret = (
  stripeObj: Stripe.Subscription | Stripe.PaymentIntent
): string => {
  const clientSecret = (stripeObj as any)?.client_secret
    ? ((stripeObj as any).client_secret as string)
    : (stripeObj as any)?.latest_invoice?.payment_intent?.client_secret
      ? ((stripeObj as any).latest_invoice.payment_intent.client_secret as string)
      : null;

  if (!clientSecret)
    throw new Error(`No client_secret found in Stripe ${capitalize(stripeObj.object)}.`);

  return clientSecret;
};
