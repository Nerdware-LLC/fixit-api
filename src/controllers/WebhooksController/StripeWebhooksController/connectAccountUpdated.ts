import { getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { UserStripeConnectAccount, SCA_SK_PREFIX_STR } from "@/models/UserStripeConnectAccount";
import { logger } from "@/utils/logger.js";
import type Stripe from "stripe";

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
    payouts_enabled: payoutsEnabled,
  } = rawStripeConnectAccountObj;

  let userID: string | undefined;

  try {
    // Get "userID" needed for the primary key
    const queryResult = await UserStripeConnectAccount.query({
      where: {
        id: stripeConnectAccountID,
        sk: { beginsWith: SCA_SK_PREFIX_STR },
      },
      limit: 1,
    });

    const userID = queryResult[0]?.userID;

    if (!userID)
      throw new Error(
        `UserStripeConnectAccount not found for StripeConnectAccount ID: "${stripeConnectAccountID}"`
      );

    // Now update the user's Stripe Connect Account item in the db
    await UserStripeConnectAccount.updateItem(
      { userID },
      {
        update: {
          detailsSubmitted,
          chargesEnabled,
          payoutsEnabled,
        },
      }
    );
  } catch (err) {
    const error = getTypeSafeError(err);
    // If err, log it, do not re-throw from here.
    logger.error(
      `Failed to update UserStripeConnectAccount.
        StripeConnectAccount ID: "${stripeConnectAccountID}"
        User ID:                 "${userID ?? "unknown"}"
        Error:                   ${error.message}`,
      "StripeWebhookHandler.connectAccountUpdated"
    );
  }
};
