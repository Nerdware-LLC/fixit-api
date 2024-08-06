import type Stripe from "stripe";
import type { OverrideProperties, SetNonNullable } from "type-fest";

/**
 * An expanded {@link Stripe.Customer} object with the fields necessary to
 * obtain a `client_secret`. **This type can _only_ be used when the Stripe API
 * call is provided with an `expand` arg which includes the following field:**
 *
 * ```ts
 * // Example usage:
 * const customer = (await stripe.customers.create({
 *   // ... other args ...
 *   expand: [
 *     "subscriptions.data.latest_invoice.payment_intent"
 *   ]
 * })) as Stripe.Response<StripeCustomerWithClientSecret>;
 * ```
 */
export type StripeCustomerWithClientSecret = OverrideProperties<
  Stripe.Customer,
  { subscriptions: Stripe.ApiList<StripeSubscriptionWithClientSecret> }
>;

/**
 * An expanded {@link Stripe.Subscription} object with the fields necessary to
 * obtain a `client_secret`. **This type can _only_ be used when the Stripe API
 * call is provided with an `expand` arg which includes the following fields:**
 *
 * ```ts
 * // Example usage:
 * const subscription = (await stripe.subscriptions.create({
 *   // ... other args ...
 *   expand: [
 *     "latest_invoice.payment_intent",
 *     "pending_setup_intent"
 *   ]
 * })) as Stripe.Response<StripeSubscriptionWithClientSecret>;
 * ```
 */
export type StripeSubscriptionWithClientSecret = OverrideProperties<
  Stripe.Subscription,
  {
    latest_invoice: StripeInvoiceWithClientSecret;
    pending_setup_intent: StripeSetupIntentWithClientSecret;
  }
>;

/** See type {@link StripeSubscriptionWithClientSecret} */
export type StripeInvoiceWithClientSecret = OverrideProperties<
  Stripe.Invoice,
  { payment_intent: StripePaymentIntentWithClientSecret | null }
>;

/** See type {@link StripeInvoiceWithClientSecret} */
export type StripePaymentIntentWithClientSecret = SetNonNullable<
  Stripe.PaymentIntent,
  "client_secret"
>;

/** See type {@link StripeSubscriptionWithClientSecret} */
export type StripeSetupIntentWithClientSecret = SetNonNullable<Stripe.SetupIntent, "client_secret">;
