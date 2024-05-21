import { stripe } from "@/lib/stripe/stripeClient.js";
import { UserSubscription, type UserSubscriptionItem } from "@/models/UserSubscription";
import { normalizeStripeFields } from "./normalizeStripeFields.js";

/**
 * Fetches up-to-date Subscription data from Stripe and updates the DB if necessary.
 *
 * - `UserSubscriptionItem` fields kept in sync with Stripe:
 *   - `status`
 *   - `currentPeriodEnd`
 *
 * - `UserSubscriptionItem` fields needed to update the db, if necessary:
 *   - `userID`
 *   - `sk` (the UserSubscriptionItem SK)
 *
 * @returns Up-to-date UserSubscription fields.
 */
export const refreshDataFromStripe = async (
  existingSub: UserSubscriptionItem
): Promise<UserSubscriptionItem> => {
  // Fetch fresh data from Stripe
  const stripeRetrieveSubResult = await stripe.subscriptions.retrieve(existingSub.id);

  // Normalize the object returned from Stripe
  const stripeSub = normalizeStripeFields(stripeRetrieveSubResult);

  // If DB values are stale, update the user's Sub in the db
  if (
    stripeSub.status !== existingSub.status ||
    stripeSub.currentPeriodEnd.getTime() !== existingSub.currentPeriodEnd.getTime()
  ) {
    // Return the updated Sub
    return await UserSubscription.updateItem(
      {
        userID: existingSub.userID,
        sk: existingSub.sk,
      },
      {
        update: {
          status: stripeSub.status,
          currentPeriodEnd: stripeSub.currentPeriodEnd,
        },
      }
    );
  }

  // If no update is required, return the existing Sub fields
  return existingSub;
};
