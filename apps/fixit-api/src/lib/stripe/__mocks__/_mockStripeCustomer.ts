import dayjs from "dayjs";
import deepMerge from "lodash.merge";
import { mockStripeSubscription } from "./_mockStripeSubscription.js";
import type { UserItem } from "@/models/User";
import type { UserSubscriptionItem } from "@/models/UserSubscription";
import type Stripe from "stripe";

/**
 * Returns a mock Stripe Customer object.
 * @see https://stripe.com/docs/api/customers/object
 */
export const mockStripeCustomer = (
  mockUser: UserItem & { subscription: UserSubscriptionItem },
  customerUpdateParams?: Stripe.CustomerUpdateParams
): Stripe.Customer => {
  const { stripeCustomerID, email, phone = null, profile, createdAt } = mockUser;

  const defaultPaymentMethodID =
    customerUpdateParams?.invoice_settings?.default_payment_method ?? "pm_TestTestTest";

  // Default mock Customer object
  const defaultMockCustomerObj = {
    object: "customer",
    id: stripeCustomerID,
    email,
    phone,
    description: profile.displayName,
    balance: 0,
    created: dayjs(createdAt).unix(),
    default_source: defaultPaymentMethodID,
    invoice_settings: {
      default_payment_method: defaultPaymentMethodID,
      custom_fields: null,
      footer: null,
      rendering_options: null,
    },
    subscriptions: {
      object: "list",
      url: `/v1/customers/${stripeCustomerID}/subscriptions`,
      has_more: false,
      data: [mockStripeSubscription(mockUser, { default_payment_method: defaultPaymentMethodID })],
    },
    livemode: false,
    metadata: {},
    shipping: null,
  } as const satisfies Stripe.Customer;

  return customerUpdateParams
    ? deepMerge(defaultMockCustomerObj, customerUpdateParams)
    : defaultMockCustomerObj;
};

/**
 * Returns a mock Stripe DeletedCustomer object.
 * @see https://stripe.com/docs/api/customers/object
 */
export const mockStripeDeletedCustomer = ({
  stripeCustomerID,
}: Pick<UserItem, "stripeCustomerID">): Stripe.DeletedCustomer => ({
  object: "customer",
  id: stripeCustomerID,
  deleted: true,
});
