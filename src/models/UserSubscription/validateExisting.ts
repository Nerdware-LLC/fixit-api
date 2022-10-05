import moment from "moment";
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

export const validateExisting = function ({ status, currentPeriodEnd }: UserSubscriptionType) {
  if (
    !status ||
    !(status in SUBSCRIPTION_STATUSES) ||
    (SUBSCRIPTION_STATUSES?.[status] as SubscriptionStatusConfig)?.isValid !== true ||
    !currentPeriodEnd ||
    !moment(currentPeriodEnd).isValid()
  ) {
    // prettier-ignore
    throw new Error(
      (SUBSCRIPTION_STATUSES?.[status] as SubscriptionStatusConfig)?.errMsg ?? "Invalid subscription."
    );
  }

  // Coerce to unix timestamp in seconds and compare
  if (moment().unix() >= moment(currentPeriodEnd).unix()) {
    throw new Error(
      "This subscription has expired; please submit payment to re-activate your subscription."
    );
  }
};

interface SubscriptionStatusConfig {
  isValid?: boolean;
  errMsg?: string;
}
