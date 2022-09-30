import type { UserSubscriptionType } from "./types";

// sub statuses info: https://stripe.com/docs/api/subscriptions/object#subscription_object-status
// prettier-ignore
export const SUBSCRIPTION_STATUSES = {
  // Statuses which are valid for service usage:
  active: { isValid: true },
  trialing: { isValid: true },
  // Statuses for which are NOT valid for service usage:
  incomplete: { errMsg: "Sorry, your subscription payment is incomplete." },
  incomplete_expired: { errMsg: "Sorry, please try again." },
  past_due: { errMsg: "Sorry, payment for your subscription is past due. Please submit payment and try again." },
  canceled: { errMsg: "Sorry, this subscription was canceled." },
  unpaid: { errMsg: "Sorry, payment for your subscription is past due. Please submit payment and try again." }
} as const;

export const validateExisting = function (sub?: UserSubscriptionType) {
  if (!sub || !sub?.currentPeriodEnd || !sub?.status) {
    throw new Error("Invalid subscription.");
  }

  // prettier-ignore
  const subStatusConfig: { isValid?: boolean; errMsg?: string } = SUBSCRIPTION_STATUSES?.[sub.status];

  if (!subStatusConfig || (subStatusConfig?.isValid ?? false)) {
    throw new Error(subStatusConfig?.errMsg ?? "Invalid subscription.");
  }

  const subExpiration = sub.currentPeriodEnd;
  // Coerce to unix timestamp as js number
  const subExpirationUnixTime =
    typeof subExpiration === "number"
      ? subExpiration * 1000 // FIXME I think this should already be in milliseconds, and therefore this must be removed.
      : typeof subExpiration === "string"
      ? new Date(subExpiration).getTime()
      : 0;

  if (Date.now() >= subExpirationUnixTime) {
    throw new Error("This subscription has expired; please submit payment to re-activate.");
  }
};
