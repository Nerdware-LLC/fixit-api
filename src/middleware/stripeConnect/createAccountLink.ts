import { stripe } from "@lib/stripe";
import { mwAsyncCatchWrapper } from "@middleware/helpers";

/**
 * This middleware creates a Stripe account link for authenticated users.
 *
 * - `req.originalUrl = "/api/connect/account-link"`
 */
export const createAccountLink = mwAsyncCatchWrapper<{ body: { returnURL: string } }>(
  async (req, res, next) => {
    if (!req?._authenticatedUser) return next("User not found.");
    if (!req._authenticatedUser?.stripeConnectAccount)
      return next("User's Stripe Connect account not found.");

    const stripeLink = await stripe.accountLinks.create({
      account: req._authenticatedUser.stripeConnectAccount.id,
      return_url: `${req.body.returnURL}?connect-return`,
      refresh_url: `${req.body.returnURL}?connect-refresh`,
      type: "account_onboarding",
    });

    res.json({ stripeLink: stripeLink.url });
  }
);
