import moment from "moment";
import { UserSubscription } from "@models/UserSubscription";
import { logger, getTypeSafeError } from "@utils";
import type Stripe from "stripe";

/**
 * Stripe webhook handler for event: `"customer.subscription.deleted"`
 *
 * In this event, `req.event.data.object` is a Stripe Subscription object.
 */
export const customerSubscriptionDeleted = async (
  rawStripeSubscriptionObj: Stripe.Subscription
) => {
  // Normalize the Stripe-provided fields first
  const { id: subID, createdAt } = UserSubscription.normalizeStripeFields(rawStripeSubscriptionObj);

  let userID;

  try {
    // Get "userID" needed for the primary key
    const { userID } = await UserSubscription.queryBySubscriptionID(subID);

    // Delete the user's subscription item
    await UserSubscription.deleteItem({
      userID,
      sk: `SUBSCRIPTION#${userID}#${moment(createdAt).unix()}`,
    });
  } catch (err) {
    const error = getTypeSafeError(err);

    // If err, log it, do not re-throw from here.
    logger.error(
      `Failed to delete UserSubscription.
        Subscription ID: "${subID}"
        User ID:         "${userID ?? "unknown"}"
        Error:           ${error.message}`,
      "StripeWebhookHandler.customerSubscriptionDeleted"
    );
  }
};
