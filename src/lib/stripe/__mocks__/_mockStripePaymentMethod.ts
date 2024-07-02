import dayjs from "dayjs";
import deepMerge from "lodash.merge";
import type { UserItem } from "@/models/User";
import type Stripe from "stripe";
import type { SetRequired } from "type-fest";

/**
 * Returns a mock Stripe PaymentMethod object.
 * @see https://stripe.com/docs/api/payment_methods/object
 */
export const mockStripePaymentMethod = (
  { stripeCustomerID, email, phone = null, profile, createdAt }: UserItem,
  { id: paymentMethodID, ...customValues }: SetRequired<Partial<Stripe.PaymentMethod>, "id">
): Stripe.PaymentMethod => {
  // Default mock PaymentMethod object
  const defaultMockPaymentMethodObj: Stripe.PaymentMethod = {
    object: "payment_method",
    id: paymentMethodID,
    type: "card",
    created: dayjs(createdAt).unix(),
    customer: stripeCustomerID,
    billing_details: {
      address: {
        city: null,
        country: null,
        line1: null,
        line2: null,
        postal_code: null,
        state: null,
      },
      name: profile.displayName,
      email,
      phone,
    },
    card: {
      brand: "visa",
      checks: {
        address_line1_check: null,
        address_postal_code_check: null,
        cvc_check: "pass",
      },
      country: "US",
      exp_month: 8,
      exp_year: 2024,
      fingerprint: "Xt5EWLLDS7FJjR1c",
      funding: "credit",
      last4: "4242",
      networks: { available: ["visa"], preferred: null },
      three_d_secure_usage: { supported: true },
      wallet: null,
    },
    livemode: false,
    metadata: {},
  };

  return deepMerge(defaultMockPaymentMethodObj, customValues);
};
