import { stripe } from "@/lib/stripe/stripeClient.js";
import {
  UserStripeConnectAccount,
  type UserStripeConnectAccountItem,
} from "@/models/UserStripeConnectAccount";

/**
 * Fetches up-to-date Stripe Connect Account data from Stripe and updates the DB if necessary.
 *
 * - `UserStripeConnectAccountItem` fields kept in sync with Stripe:
 *   - `detailsSubmitted`
 *   - `chargesEnabled`
 *   - `payoutsEnabled`
 *
 * - `UserStripeConnectAccountItem` fields needed to update the db, if necessary:
 *   - `id` (the Stripe-provided SCA ID)
 *   - `userID`
 *
 * @returns Up-to-date UserStripeConnectAccount fields.
 */
export const refreshDataFromStripe = async (
  existingSCA: UserStripeConnectAccountItem
): Promise<UserStripeConnectAccountItem> => {
  // Get up-to-date values from Stripe
  const stripeSCA = await stripe.accounts.retrieve(existingSCA.id);

  // Update DB if existing values are stale
  if (
    stripeSCA.details_submitted !== existingSCA.detailsSubmitted ||
    stripeSCA.charges_enabled !== existingSCA.chargesEnabled ||
    stripeSCA.payouts_enabled !== existingSCA.payoutsEnabled
  ) {
    // Return the updated SCA
    return await UserStripeConnectAccount.updateItem(
      { userID: existingSCA.userID },
      {
        update: {
          detailsSubmitted: stripeSCA.details_submitted,
          chargesEnabled: stripeSCA.charges_enabled,
          payoutsEnabled: stripeSCA.payouts_enabled,
        },
      }
    );
  }

  // If no update is required, return the existing SCA fields
  return existingSCA;
};
