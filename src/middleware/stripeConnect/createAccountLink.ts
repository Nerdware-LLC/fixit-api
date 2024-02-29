import { stripe } from "@/lib/stripe/stripeClient.js";
import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";

/**
 * This middleware creates a Stripe ConnectAccount link for authenticated users.
 */
export const createAccountLink = mwAsyncCatchWrapper<
  RestApiRequestBodyByPath["/connect/account-link"]
>(async (req, res, next) => {
  const { authenticatedUser } = res.locals;

  if (!authenticatedUser) return next("User not found.");
  if (!authenticatedUser?.stripeConnectAccount)
    return next("User's Stripe Connect account not found.");

  const stripeLink = await stripe.accountLinks.create({
    account: authenticatedUser.stripeConnectAccount.id,
    return_url: `${req.body.returnURL}?connect-return`,
    refresh_url: `${req.body.returnURL}?connect-refresh`,
    type: "account_onboarding",
  });

  res.json({ stripeLink: stripeLink.url });
});
