import { UserSubscription } from "@models/UserSubscription";
import { logger } from "@utils/logger";

/**
 * Stripe webhook handler for event: `"customer.subscription.deleted"`
 *
 * In this event, `req.event.data.object` is a Stripe Subscription object.
 */
export const customerSubscriptionDeleted = async (rawStripeSubscriptionObj) => {
  // Normalize the Stripe-provided fields first
  const { id: subID } = UserSubscription.normalizeStripeFields(rawStripeSubscriptionObj);

  let userID;

  try {
    // The "data" GSI is queried for the "userID" needed for the primary key.
    const { userID, createdAt } = await UserSubscription.query("data")
      .eq(subID)
      .using("Overloaded_Data_GSI")
      .exec();

    // Delete the user's subscription item
    await UserSubscription.delete({
      pk: userID,
      sk: `SUBSCRIPTION#${userID}#${createdAt}`
    });
  } catch (err) {
    // If err, log it, do not re-throw from here.
    logger.error(
      `Failed to delete User Subscription.
        Subscription ID: "${subID}"
        User ID:         "${userID ?? "unknown"}"
        Error:           ${err}`,
      "StripeWebhookHandler.customerSubscriptionDeleted"
    );
  }
};
