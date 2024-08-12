import { hasKey } from "@nerdware/ts-type-safety-utils";
import dayjs from "dayjs";
import { PaymentRequiredError } from "@/utils/httpErrors.js";
import type { SubscriptionStatus } from "@/types/graphql.js";
import type { AuthTokenPayload } from "@/types/open-api.js";

/**
 * ### AuthService: Verify User Is Authorized To Access Paid Content
 *
 * Verify whether a User's existing subscription is valid for service-access.
 *
 * A UserSubscription is only considered valid for service-access if all of the following are true:
 *
 *    1. The subscription's status is `active` or `trialing`.
 *    2. The subscription's `currentPeriodEnd` timestamp is in the future.
 */
export const verifyUserIsAuthorizedToAccessPaidContent = ({
  authenticatedUser,
}: {
  authenticatedUser: AuthTokenPayload;
}) => {
  // Destructure necessary fields
  const { status, currentPeriodEnd } = authenticatedUser.subscription ?? {};

  if (
    !status ||
    !hasKey(SUB_STATUS_AUTH_METADATA, status) ||
    SUB_STATUS_AUTH_METADATA[status].isValid !== true ||
    !currentPeriodEnd ||
    !dayjs(currentPeriodEnd).isValid()
  ) {
    throw new Error(
      !!status && hasKey(SUB_STATUS_AUTH_METADATA, status)
        ? SUB_STATUS_AUTH_METADATA[status].reason ?? "Invalid subscription."
        : "Invalid subscription."
    );
  }

  // Coerce to unix timestamp in seconds and compare
  if (dayjs().unix() >= dayjs(currentPeriodEnd).unix()) {
    throw new PaymentRequiredError(
      "This subscription has expired — please update your payment settings to re-activate your subscription."
    );
  }
};

/**
 * Subscription-Status authorization metadata objects:
 *
 * - Subscription statuses which indicate a sub IS VALID for Fixit service usage
 *   contain `isValid: true`.
 * - Subscription statuses which indicate a sub IS NOT VALID for Fixit service
 *   usage contain a `reason` plainly explaining to end users _why_ their sub is
 *   invalid, and what their course of action should be to resolve the issue.
 *
 * @see https://stripe.com/docs/api/subscriptions/object#subscription_object-status
 */
export const SUB_STATUS_AUTH_METADATA: Readonly<
  Record<
    SubscriptionStatus,
    { isValid: true; reason?: never } | { isValid?: false; reason: string }
  >
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
};
