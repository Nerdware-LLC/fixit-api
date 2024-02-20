import type Stripe from "stripe";
import type { OverrideProperties, SetNonNullable } from "type-fest";

/**
 * This generic util takes a Stripe object with a `"client_secret"` property
 * (e.g., a {@link Stripe.PaymentIntent} or {@link Stripe.SetupIntent}), and
 * makes the property non-nullable (converts the value to `string`).
 */
type NonNullableClientSecret<T extends { client_secret: string | null }> = SetNonNullable<
  T,
  "client_secret"
>;

/** {@link Stripe.PaymentIntent} with a non-nullable `client_secret` (`client_secret: string`). */
export type StripePaymentIntentWithClientSecret = NonNullableClientSecret<Stripe.PaymentIntent>;

/** {@link Stripe.SetupIntent} with a non-nullable `client_secret` (`client_secret: string`). */
export type StripeSetupIntentWithClientSecret = NonNullableClientSecret<Stripe.SetupIntent>;

/**
 * This type reflects a {@link Stripe.Subscription} object whereby the fields which are
 * necessary to obtain a `client_secret` have been expanded:
 *
 * - `latest_invoice.payment_intent`
 * - `pending_setup_intent`
 *
 * For both of these expanded objects, the `client_secret` property is made non-nullable.
 */
export type StripeSubscriptionWithClientSecret = OverrideProperties<
  Stripe.Subscription,
  {
    latest_invoice: OverrideProperties<
      Stripe.Invoice,
      { payment_intent: StripePaymentIntentWithClientSecret }
    >;
    pending_setup_intent?: StripeSetupIntentWithClientSecret;
  }
>;

/**
 * This type reflects a {@link Stripe.Customer} object whereby the fields which are
 * necessary to obtain a `client_secret` have been expanded:
 *
 * - `latest_invoice.payment_intent`
 * - `pending_setup_intent`
 *
 * For both of these expanded objects, the `client_secret` property is made non-nullable.
 */
export type StripeCustomerWithClientSecret = OverrideProperties<
  Stripe.Customer,
  { subscriptions: Stripe.ApiList<StripeSubscriptionWithClientSecret> }
>;
