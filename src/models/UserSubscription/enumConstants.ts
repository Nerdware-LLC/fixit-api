import type { SubscriptionStatus, SubscriptionPriceName } from "@/types/graphql.js";

/**
 * A map of all subscription enums.
 */
export const SUBSCRIPTION_ENUMS = {
  PRICE_NAMES: ["ANNUAL", "MONTHLY", "TRIAL"] as const,
  STATUSES: [
    "active",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "past_due",
    "trialing",
    "unpaid",
  ] as const,
} as const satisfies {
  readonly PRICE_NAMES: ReadonlyArray<SubscriptionPriceName>;
  readonly STATUSES: ReadonlyArray<SubscriptionStatus>;
};

/**
 * A map of all subscription price names.
 */
export const SUBSCRIPTION_PRICE_NAMES = Object.fromEntries(
  SUBSCRIPTION_ENUMS.PRICE_NAMES.map((name) => [name, name])
) as { readonly [Name in SubscriptionPriceName]: Name };

/**
 * A map of all subscription statuses.
 */
export const SUBSCRIPTION_STATUSES = Object.fromEntries(
  SUBSCRIPTION_ENUMS.STATUSES.map((status) => [status, status])
) as { readonly [Status in SubscriptionStatus]: Status };

/**
 * A map of all subscription product names.
 */
export const SUBSCRIPTION_PRODUCT_NAMES = {
  FIXIT_SUBSCRIPTION: "Fixit Subscription" as const,
} as const;
