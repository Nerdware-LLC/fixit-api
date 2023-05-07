import { stripe } from "@lib/stripe";
import { catchAsyncMW, type APIRequestWithAuthenticatedUserData } from "@utils/middlewareWrappers";

// req.originalUrl = "/api/connect/account-link"
export const createAccountLink = catchAsyncMW<APIRequestWithAuthenticatedUserData>(
  async (req, res) => {
    const stripeLink = await stripe.accountLinks.create({
      account: req._user.stripeConnectAccount.id,
      return_url: `${req.body.returnURL}?connect-return`,
      refresh_url: `${req.body.returnURL}?connect-refresh`,
      type: "account_onboarding",
    });

    res.json({ stripeLink: stripeLink.url });
  }
);
