import { stripe } from "@lib/stripe";
import { UserStripeConnectAccount } from "@models/UserStripeConnectAccount";
import { catchAsyncMW, type APIRequestWithAuthenticatedUserData } from "@utils/middlewareWrappers";

export const checkOnboardingStatus = catchAsyncMW<APIRequestWithAuthenticatedUserData>(
  async (req, res, next) => {
    const { id: userID, stripeConnectAccount } = req._user;

    const { id, detailsSubmitted, chargesEnabled, payoutsEnabled } = stripeConnectAccount;

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

      req._user.stripeConnectAccount = updatedStripeConnectAccount;
    }

    next();
  }
);
