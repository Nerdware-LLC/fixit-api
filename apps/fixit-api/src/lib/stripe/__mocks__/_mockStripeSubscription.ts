import { isPlainObject, isString } from "@nerdware/ts-type-safety-utils";
import dayjs from "dayjs";
import deepMerge from "lodash.merge";
import { mockStripeInvoice } from "./_mockStripeInvoice.js";
import { mockStripePaymentIntent } from "./_mockStripePaymentIntent.js";
import { MOCK_STRIPE_PLAN } from "./_mockStripePlan.js";
import { mockStripePrice } from "./_mockStripePrice.js";
import type { UserItem } from "@/models/User";
import type { UserSubscriptionItem } from "@/models/UserSubscription";
import type Stripe from "stripe";
import type { PartialDeep } from "type-fest";

/**
 * Returns a mock Stripe Subscription object.
 * @see https://stripe.com/docs/api/subscriptions/object
 */
export const mockStripeSubscription = (
  mockUser: UserItem & { subscription: UserSubscriptionItem },
  {
    default_payment_method,
    ...customValues
  }: PartialDeep<Stripe.Subscription, { recurseIntoArrays: true }> = {}
): Stripe.Subscription => {
  const { subscription, stripeCustomerID } = mockUser;
  const createdAtUnixTimestamp = dayjs(subscription.createdAt).unix();
  const currentPeriodEndDayObject = dayjs(subscription.currentPeriodEnd);
  const currentPeriodStart = currentPeriodEndDayObject.subtract(1, "month").unix(); // <-- 1 month is arbitrary here

  const defaultPaymentMethodID: string =
    isPlainObject(default_payment_method) && isString(default_payment_method.id)
      ? default_payment_method.id
      : isString(default_payment_method)
        ? default_payment_method
        : "pm_TestTestTest";

  // Default mock Subscription object
  const defaultMockSubscriptionObj: Stripe.Subscription = {
    object: "subscription",
    id: subscription.id,
    created: createdAtUnixTimestamp,
    current_period_end: currentPeriodEndDayObject.unix(),
    current_period_start: currentPeriodStart,
    customer: stripeCustomerID,
    status: subscription.status,
    latest_invoice: mockStripeInvoice(mockUser, {
      billing_reason: "subscription_create",
      subscription: subscription.id,
      total: 500,
      amount_paid: 500,
      payment_intent: mockStripePaymentIntent(
        { amount: 500, payment_method: defaultPaymentMethodID },
        { status: "succeeded" }
      ),
    }),
    application: null,
    application_fee_percent: null,
    automatic_tax: { enabled: false },
    billing_cycle_anchor: currentPeriodStart,
    billing_thresholds: null,
    cancel_at: null,
    cancel_at_period_end: false,
    canceled_at: null,
    collection_method: "charge_automatically",
    currency: "usd",
    days_until_due: null,
    default_payment_method: defaultPaymentMethodID,
    default_source: null,
    default_tax_rates: [],
    description: "Mock Subscription",
    discount: null,
    ended_at: null,
    items: {
      object: "list",
      data: [
        {
          id: "si_TestTestTest",
          object: "subscription_item",
          billing_thresholds: null,
          created: createdAtUnixTimestamp,
          metadata: {},
          plan: { ...MOCK_STRIPE_PLAN },
          price: mockStripePrice({
            id: subscription.priceID,
            product: subscription.productID,
            active: subscription.status === "active",
            created: createdAtUnixTimestamp,
          }),
          quantity: 1,
          subscription: subscription.id, // <-- not expandable
          tax_rates: [],
        },
      ],
      has_more: false,
      url: `/v1/subscription_items?subscription=${subscription.id}`,
    },
    livemode: false,
    metadata: {},
    next_pending_invoice_item_invoice: null,
    on_behalf_of: null,
    pause_collection: null,
    payment_settings: {
      payment_method_options: null,
      payment_method_types: null,
      save_default_payment_method: "off",
    },
    pending_invoice_item_interval: null,
    pending_setup_intent: null,
    pending_update: null,
    schedule: null,
    start_date: createdAtUnixTimestamp,
    test_clock: null,
    transfer_data: null,
    trial_end: null,
    trial_start: null,
  };

  return deepMerge(defaultMockSubscriptionObj, customValues);
};
