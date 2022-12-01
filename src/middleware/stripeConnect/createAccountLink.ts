import { stripe } from "@lib/stripe";
import { ENV } from "@server/env";
import { catchAsyncMW, type APIRequestWithAuthenticatedUserData } from "@utils/middlewareWrappers";

const BASE_ONBOARDING_URL = `${ENV.CONFIG.API_BASE_URL}/connect`;

// req.originalUrl = "/connect/account-link"
export const createAccountLink = catchAsyncMW<APIRequestWithAuthenticatedUserData>(
  async (req, res) => {
    const stripeLink = await stripe.accountLinks.create({
      account: req._user.stripeConnectAccount.id,
      return_url: `${BASE_ONBOARDING_URL}/return`,
      refresh_url: `${BASE_ONBOARDING_URL}/refresh`,
      type: "account_onboarding"
    });

    res.json({ stripeLink });
  }
);
