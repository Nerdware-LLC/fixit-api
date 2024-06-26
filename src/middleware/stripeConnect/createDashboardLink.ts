import { stripe } from "@/lib/stripe/stripeClient.js";
import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import { AuthError } from "@/utils/httpErrors.js";

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
  const { authenticatedUser } = res.locals;

  if (!authenticatedUser) return next(new AuthError("User not found"));
  if (!authenticatedUser?.stripeConnectAccount)
    return next("User's Stripe Connect account not found.");

  const stripeLink = await stripe.accounts.createLoginLink(
    authenticatedUser.stripeConnectAccount.id
  );

  res.json({ stripeLink: stripeLink.url });
});
