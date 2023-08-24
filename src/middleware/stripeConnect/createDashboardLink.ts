import { stripe } from "@/lib/stripe";
import { mwAsyncCatchWrapper } from "@/middleware/helpers";

/**
 * This middleware creates a Stripe dashboard link for authenticated users.
 *
 * Example account-login-link response object:
 *
 * ```json
 * {
 *   "object": "login_link",
 *   "created": 1495580507,
 *   "url": "https://stripe.com/express/Ln7FfnNpUcCU"
 * }
 * ```
 */
export const createDashboardLink = mwAsyncCatchWrapper(async (req, res, next) => {
  if (!req?._authenticatedUser) return next("User not found");
  if (!req._authenticatedUser?.stripeConnectAccount)
    return next("User's Stripe Connect account not found.");

  const stripeLink = await stripe.accounts.createLoginLink(
    req._authenticatedUser.stripeConnectAccount.id
  );

  res.json({ stripeLink: stripeLink.url });
});
