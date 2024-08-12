import { getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { UserSubscription } from "@/models/UserSubscription";
import { UserSubscriptionService } from "@/services/UserSubscriptionService";
import { logger } from "@/utils/logger.js";
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
  const { id: subID, createdAt } =
    UserSubscriptionService.normalizeStripeFields(rawStripeSubscriptionObj);

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

    // Delete the user's subscription item
    await UserSubscription.deleteItem({
      userID,
      sk: UserSubscription.getFormattedSK(userID, createdAt),
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
