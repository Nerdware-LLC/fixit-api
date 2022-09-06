import { UserStripeConnectAccount } from "@models/UserStripeConnectAccount";
import { logger } from "@utils/logger";

/**
 * Stripe webhook handler for event: `"account.updated"`
 *
 * In this event, `req.event.data.object` is a Stripe Connect Account object.
 */
export const connectAccountUpdated = async (rawStripeConnectAccountObj) => {
  const {
    id: stripeConnectAccountID,
    details_submitted: detailsSubmitted,
    charges_enabled: chargesEnabled,
    payouts_enabled: payoutsEnabled
  } = rawStripeConnectAccountObj;

  let userID;

  try {
    // The "data" GSI is queried for the "userID" needed for the primary key.
    let { userID } = await UserStripeConnectAccount.query("data")
      .eq(stripeConnectAccountID)
      .using("Overloaded_Data_GSI")
      .exec();

    // Now update the user's Stripe Connect Account item in the db
    await UserStripeConnectAccount.update(
      {
        pk: userID,
        sk: `STRIPE_CONNECT_ACCOUNT#${userID}`
      },
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
