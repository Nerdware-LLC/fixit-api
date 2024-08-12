import { getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { UserSubscription } from "@/models/UserSubscription";
import { UserSubscriptionService } from "@/services/UserSubscriptionService";
import { logger } from "@/utils/logger.js";
import type Stripe from "stripe";

/**
 * Stripe webhook handler for events:
 * - `"customer.subscription.created"`
 * - `"customer.subscription.updated"`
 * - `"customer.subscription.pending_update_applied"`
 * - `"customer.subscription.pending_update_expired"`
 * - `"customer.subscription.trial_will_end"`
 *
 * In this event, `req.event.data.object` is a Stripe Subscription object.
 */
export const customerSubscriptionUpdated = async (
  rawStripeSubscriptionObj: Stripe.Subscription
) => {
  // Normalize the Stripe-provided fields first
  const {
    id: subID,
    currentPeriodEnd,
    productID,
    priceID,
    status,
    createdAt,
  } = UserSubscriptionService.normalizeStripeFields(rawStripeSubscriptionObj);

  let userID: string | undefined;

  try {
    // Submit query for the UserSubscription item
    const [userSubscription] = await UserSubscription.query({
      where: {
        id: subID,
        sk: { beginsWith: UserSubscription.SK_PREFIX },
      },
      limit: 1,
    });

    // Get "userID" needed for the primary key
    const { userID } = userSubscription ?? {};

    // If no user ID, throw an error
    if (!userID) throw new Error(`User ID not found for UserSubscription with ID "${subID}".`);

    await UserSubscription.updateItem(
      {
        userID,
        sk: UserSubscription.getFormattedSK(userID, createdAt),
      },
      {
        update: {
          id: subID,
          currentPeriodEnd,
          productID,
          priceID,
          status,
        },
      }
    );
  } catch (err) {
    const error = getTypeSafeError(err);

    // If err, log it, do not re-throw from here.
    logger.error(
      `Failed to update UserSubscription.
        Subscription ID: "${subID}"
        User ID:         "${userID ?? "unknown"}"
        Error:           ${error.message}`,
      "StripeWebhookHandler.customerSubscriptionUpdated"
    );
  }
};
