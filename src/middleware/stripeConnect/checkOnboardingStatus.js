import { stripe } from "@lib/stripe";
import { UserStripeConnectAccount } from "@models/UserStripeConnectAccount";
import { catchAsyncMW } from "@utils/middlewareWrappers";

export const checkOnboardingStatus = catchAsyncMW(async (req, res, next) => {
  const { id: userID, stripeConnectAccount } = req._user;

  const { id, detailsSubmitted, chargesEnabled, payoutsEnabled } = stripeConnectAccount;

  const { details_submitted, charges_enabled, payouts_enabled } = await stripe.accounts.retrieve(
    id
  );

  // Update DB if values are stale
  if (
    details_submitted !== !!detailsSubmitted ||
    charges_enabled !== !!chargesEnabled ||
    payouts_enabled !== !!payoutsEnabled
  ) {
    const updatedStripeConnectAccount = await UserStripeConnectAccount.updateItem(
      {
        userID,
        sk: `STRIPE_CONNECT_ACCOUNT#${userID}`
      },
      {
        detailsSubmitted: !!details_submitted,
        chargesEnabled: !!charges_enabled,
        payoutsEnabled: !!payouts_enabled
      }
    );

    req._user.stripeConnectAccount = updatedStripeConnectAccount;
  }

  next();
});
