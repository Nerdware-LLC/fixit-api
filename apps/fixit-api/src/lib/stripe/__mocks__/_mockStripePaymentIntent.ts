import dayjs from "dayjs";
import deepMerge from "lodash.merge";
import type Stripe from "stripe";
import type { PartialDeep, SetOptional } from "type-fest";

/**
 * Returns a mock Stripe PaymentIntent object.
 * @see https://stripe.com/docs/api/payment_intents
 */
export const mockStripePaymentIntent = (
  {
    amount,
    currency = "usd",
    confirm = true,
    confirmation_method = confirm === true ? "automatic" : "manual",
    capture_method = "automatic",
    description = "Mock PaymentIntent",
    customer,
    payment_method,
    on_behalf_of,
    transfer_data,
  }: SetOptional<Stripe.PaymentIntentCreateParams, "currency">,
  customValues?: PartialDeep<Stripe.PaymentIntent, { recurseIntoArrays: true }> | null
): Stripe.PaymentIntent => {
  // Default mock PaymentIntent object
  const defaultMockPaymentIntentObj: Stripe.PaymentIntent = {
    object: "payment_intent",
    id: "pi_TestTestTest",
    amount,
    currency,
    created: dayjs().unix(),
    status: "succeeded",
    capture_method,
    client_secret: "pi_TestTestTest",
    confirmation_method,
    description,
    customer: customer ?? null,
    on_behalf_of: on_behalf_of ?? null,
    payment_method: payment_method ?? null,
    transfer_data: transfer_data ?? null,
    // The following fields are not currently used by the app, but are included here for completeness.
    amount_capturable: amount,
    amount_received: amount,
    application: null,
    application_fee_amount: null,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    invoice: null,
    last_payment_error: null,
    livemode: false,
    metadata: {},
    next_action: null,
    payment_method_options: {
      card: {
        installments: null,
        mandate_options: null,
        network: null,
        request_three_d_secure: "automatic",
      },
    },
    payment_method_types: ["card"],
    processing: null,
    receipt_email: null,
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    transfer_group: null,
  };

  return customValues
    ? deepMerge(defaultMockPaymentIntentObj, customValues)
    : defaultMockPaymentIntentObj;
};
