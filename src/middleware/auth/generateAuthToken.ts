import { mwCatchWrapper } from "@/middleware/helpers";
import { AuthToken } from "@/utils/AuthToken";

/**
 * This middleware generates an AuthToken for the authenticated User to be
 * included in the returned response. If the User is not found or the User's
 * Stripe Connect account is not found, an error message is passed to `next`.
 */
export const generateAuthToken = mwCatchWrapper((req, res, next) => {
  const { authenticatedUser } = res.locals;

  if (!authenticatedUser?.id) return next("User not found");
  if (!authenticatedUser?.stripeConnectAccount?.id) {
    return next("User's Stripe Connect account not found");
  }

  const authToken = new AuthToken(authenticatedUser);

  res.locals.authToken = authToken.toString();

  next();
});
