import { UserSubscription } from "@models/UserSubscription";
import { logger } from "@utils/logger";

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
export const customerSubscriptionUpdated = async (rawStripeSubscriptionObj) => {
  // Normalize the Stripe-provided fields first
  const {
    id: subscriptionID,
    currentPeriodEnd,
    productID,
    priceID,
    status
  } = UserSubscription.normalizeStripeFields(rawStripeSubscriptionObj);

  let userID;

  try {
    // The "data" GSI is queried for the "userID" needed for the primary key.
    const { userID, createdAt } = await UserSubscription.query("data")
      .eq(subscriptionID)
      .using("Overloaded_Data_GSI")
      .exec();

    // Upsert, bc incomplete_expired subs need to be replaced so user's don't have dupe subs in db.
    await UserSubscription.update({
      pk: userID,
      sk: `SUBSCRIPTION#${userID}#${createdAt}`,
      id: subscriptionID,
      currentPeriodEnd,
      productID,
      priceID,
      status
    });
  } catch (err) {
    // If err, log it, do not re-throw from here.
    logger.error(
      `Failed to update User Subscription.
        Subscription ID: "${subscriptionID}"
        User ID:         "${userID ?? "unknown"}"
        Error:           ${err}`,
      "StripeWebhookHandler.customerSubscriptionUpdated"
    );
  }
};
