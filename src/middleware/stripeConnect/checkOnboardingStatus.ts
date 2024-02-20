import { stripe } from "@/lib/stripe";
import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { UserStripeConnectAccount } from "@/models/UserStripeConnectAccount";

/**
 * Checks the status of the user's Stripe Connect account capabilities and updates the DB
 * if the values are stale (`details_submitted`, `charges_enabled`, and `payouts_enabled`).
 */
export const checkOnboardingStatus = mwAsyncCatchWrapper(async (req, res, next) => {
  if (!res.locals?.authenticatedUser) return next("User not found");

  const { authenticatedUser } = res.locals;

  if (!authenticatedUser?.stripeConnectAccount)
    return next("User's Stripe Connect account not found");

  const {
    id: userID,
    stripeConnectAccount: { id, detailsSubmitted, chargesEnabled, payoutsEnabled },
  } = authenticatedUser;

  // prettier-ignore
  const { details_submitted, charges_enabled, payouts_enabled } = await stripe.accounts.retrieve(id);

  // Update DB if values are stale
  if (
    details_submitted !== !!detailsSubmitted ||
    charges_enabled !== !!chargesEnabled ||
    payouts_enabled !== !!payoutsEnabled
  ) {
    const updatedStripeConnectAccount = await UserStripeConnectAccount.updateItem(
      { userID },
      {
        update: {
          detailsSubmitted: !!details_submitted,
          chargesEnabled: !!charges_enabled,
          payoutsEnabled: !!payouts_enabled,
        },
      }
    );

    res.locals.authenticatedUser.stripeConnectAccount = {
      ...authenticatedUser.stripeConnectAccount,
      ...(updatedStripeConnectAccount ?? {}),
    };
  }

  next();
});
