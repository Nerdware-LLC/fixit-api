import { stripe } from "@lib/stripe";
import { mwAsyncCatchWrapper } from "@middleware/helpers";
import { UserStripeConnectAccount } from "@models/UserStripeConnectAccount";

export const checkOnboardingStatus = mwAsyncCatchWrapper(async (req, res, next) => {
  if (!req?._authenticatedUser) return next("User not found");
  if (!req._authenticatedUser?.stripeConnectAccount)
    return next("User's Stripe Connect account not found");

  const {
    id: userID,
    stripeConnectAccount: { id, detailsSubmitted, chargesEnabled, payoutsEnabled },
  } = req._authenticatedUser;

  // prettier-ignore
  const { details_submitted, charges_enabled, payouts_enabled } = await stripe.accounts.retrieve(id);

  // Update DB if values are stale
  if (
    details_submitted !== !!detailsSubmitted ||
    charges_enabled !== !!chargesEnabled ||
    payouts_enabled !== !!payoutsEnabled
  ) {
    const updatedStripeConnectAccount = await UserStripeConnectAccount.updateOne(
      { userID },
      {
        detailsSubmitted: !!details_submitted,
        chargesEnabled: !!charges_enabled,
        payoutsEnabled: !!payouts_enabled,
      }
    );

    req._authenticatedUser.stripeConnectAccount = {
      ...req._authenticatedUser.stripeConnectAccount,
      ...(updatedStripeConnectAccount ?? {}),
    };
  }

  next();
});
