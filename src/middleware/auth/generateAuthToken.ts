import { mwCatchWrapper } from "@middleware/helpers";
import { AuthToken } from "@utils";
import type { FixitApiAuthTokenPayload } from "@utils";

/**
 * This middleware generates an AuthToken for the authenticated User and
 * returns it as a response. If the User is not found or the User's Stripe
 * Connect account is not found, an error message is passed to `next`. If
 * there are any pre-fetched user items, they are included in the response
 * as "userItems".
 */
export const generateAuthToken = mwCatchWrapper((req, res, next) => {
  const { _authenticatedUser, _userQueryItems } = req;

  if (!_authenticatedUser?.id) return next("User not found");
  if (!_authenticatedUser?.stripeConnectAccount?.id) {
    return next("User's Stripe Connect account not found");
  }

  const token = new AuthToken(_authenticatedUser as FixitApiAuthTokenPayload);

  res.json({
    token: token.toString(),
    ...(!!_userQueryItems && { userItems: _userQueryItems }),
  });
});
