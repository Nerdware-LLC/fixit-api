import dayjs from "dayjs";
import { hasKey } from "@utils";
import type { SubscriptionStatus } from "@types";
import type { UserSubscriptionModelItem } from "./UserSubscription";

/**
 * This function is used to validate an existing UserSubscription. A valid
 * subscription is required to access the Fixit API and related services.
 *
 * A UserSubscription is only considered valid if all of the following are true:
 *
 *    1. The subscription's status is `active` or `trialing`.
 *    2. The subscription's `currentPeriodEnd` timestamp is in the future.
 */
export const validateExisting = function ({
  status,
  currentPeriodEnd,
}: Partial<UserSubscriptionModelItem> = {}) {
  if (
    !status ||
    !hasKey(SUBSCRIPTION_STATUS_METADATA, status) ||
    SUBSCRIPTION_STATUS_METADATA?.[status]?.isValid !== true ||
    !currentPeriodEnd ||
    !dayjs(currentPeriodEnd).isValid()
  ) {
    throw new Error(
      !!status && hasKey(SUBSCRIPTION_STATUS_METADATA, status)
        ? SUBSCRIPTION_STATUS_METADATA[status]?.reason ?? "Invalid subscription."
        : "Invalid subscription."
    );
  }

  // Coerce to unix timestamp in seconds and compare
  if (dayjs().unix() >= dayjs(currentPeriodEnd).unix()) {
    throw new Error(
      "This subscription has expired - please submit payment to re-activate your subscription."
    );
  }
};

/**
 * Subscription-Status metadata objects:
 * - Subscription statuses which indicate a sub IS VALID for Fixit service usage
 *   contain `isValid: true`.
 * - Subscription statuses which indicate a sub IS NOT VALID for Fixit service
 *   usage contain a `reason` plainly explaining to end users _why_ their sub is
 *   invalid, and what their course of action should be to resolve the issue.
 *
 * @see https://stripe.com/docs/api/subscriptions/object#subscription_object-status
 */
export const SUBSCRIPTION_STATUS_METADATA: Record<
  SubscriptionStatus,
  { isValid: true; reason?: never } | { isValid?: false; reason: string }
> = {
  // Statuses which indicate a subscription IS VALID for service usage:
  active: {
    isValid: true,
  },
  trialing: {
    isValid: true,
  },
  // Statuses which indicate a subscription IS NOT VALID for service usage:
  incomplete: {
    reason: "Sorry, your subscription payment is incomplete.",
  },
  incomplete_expired: {
    reason: "Sorry, please try again.",
  },
  past_due: {
    reason: "Sorry, payment for your subscription is past due. Please submit payment and try again.", // prettier-ignore
  },
  canceled: {
    reason: "Sorry, this subscription was canceled.",
  },
  unpaid: {
    reason: "Sorry, payment for your subscription is past due. Please submit payment and try again.", // prettier-ignore
  },
} as const;
