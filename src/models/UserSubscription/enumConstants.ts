import type { SubscriptionStatus } from "@types";

export const SUBSCRIPTION_ENUM_CONSTANTS: {
  readonly STATUSES: ReadonlyArray<SubscriptionStatus>;
} = {
  STATUSES: [
    "active",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "past_due",
    "trialing",
    "unpaid",
  ] as const,
} as const;
