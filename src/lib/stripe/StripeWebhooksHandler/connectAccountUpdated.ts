import type Stripe from "stripe";
import { UserStripeConnectAccount } from "@models/UserStripeConnectAccount";
import { logger } from "@utils/logger";

/**
 * Stripe webhook handler for event: `"account.updated"`
 *
 * In this event, `req.event.data.object` is a Stripe Connect Account object.
 */
export const connectAccountUpdated = async (rawStripeConnectAccountObj: Stripe.Account) => {
  const {
    // Note: if User updates phone/email on Stripe's end, those properties are here as well.
    id: stripeConnectAccountID,
    details_submitted: detailsSubmitted,
    charges_enabled: chargesEnabled,
    payouts_enabled: payoutsEnabled
  } = rawStripeConnectAccountObj;

  let userID;

  try {
    // Get "userID" needed for the primary key
    let { userID } = await UserStripeConnectAccount.queryByStripeConnectAccountID(
      stripeConnectAccountID
    );

    // Now update the user's Stripe Connect Account item in the db
    await UserStripeConnectAccount.updateOne(
      { userID },
      {
        detailsSubmitted,
        chargesEnabled,
        payoutsEnabled
      }
    );
  } catch (err) {
    // If err, log it, do not re-throw from here.
    logger.error(
      `Failed to update Stripe Connect Account.
        StripeConnectAccount ID: "${stripeConnectAccountID}"
        User ID:                 "${userID ?? "unknown"}"
        Error:                   ${err}`,
      "StripeWebhookHandler.connectAccountUpdated"
    );
  }
};
