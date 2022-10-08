import { stripe } from "@lib/stripe";
import { ENV } from "@server/env";
import { catchAsyncMW, type APIRequestWithAuthenticatedUserData } from "@utils/middlewareWrappers";

const BASE_ONBOARDING_URL = `${ENV.CONFIG.SELF_URI}${ENV.STRIPE.CONNECT_ONBOARDING_REDIRECT_ROUTE}`;

const RETURN_URL = `${BASE_ONBOARDING_URL}/return`;
const REFRESH_URL = `${BASE_ONBOARDING_URL}/refresh`;

// req.originalUrl = "/connect/account-link"
export const createAccountLink = catchAsyncMW<APIRequestWithAuthenticatedUserData>(
  async (req, res) => {
    const stripeLink = await stripe.accountLinks.create({
      account: req._user.stripeConnectAccount.id,
      return_url: RETURN_URL,
      refresh_url: REFRESH_URL,
      type: "account_onboarding"
    });

    res.json({ stripeLink });
  }
);
