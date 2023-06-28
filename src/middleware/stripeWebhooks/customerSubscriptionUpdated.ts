import { UserSubscription } from "@models/UserSubscription";
import { logger, getTypeSafeError } from "@utils";
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
    id: subscriptionID,
    currentPeriodEnd,
    productID,
    priceID,
    status,
    createdAt,
  } = UserSubscription.normalizeStripeFields(rawStripeSubscriptionObj);

  let userID;

  try {
    const { userID } = await UserSubscription.queryBySubscriptionID(subscriptionID);

    await UserSubscription.updateOne(
      {
        userID,
        createdAt,
      },
      {
        id: subscriptionID,
        currentPeriodEnd,
        productID,
        priceID,
        status,
      }
    );
  } catch (err) {
    const error = getTypeSafeError(err);

    // If err, log it, do not re-throw from here.
    logger.error(
      `Failed to update UserSubscription.
        Subscription ID: "${subscriptionID}"
        User ID:         "${userID ?? "unknown"}"
        Error:           ${error.message}`,
      "StripeWebhookHandler.customerSubscriptionUpdated"
    );
  }
};
