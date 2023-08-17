import { mwCatchWrapper } from "@middleware/helpers";
import { AuthToken } from "@utils";
import type { FixitApiAuthTokenPayloadUserData } from "@utils";

/**
 * This middleware generates an AuthToken for the authenticated User and
 * returns it as a response. If the User is not found or the User's Stripe
 * Connect account is not found, an error message is passed to `next`. If
 * there are any pre-fetched user items, they are included in the response
 * as "userItems".
 */
export const generateAuthToken = mwCatchWrapper((req, res, next) => {
  if (!req?._authenticatedUser) return next("User not found");
  if (!req._authenticatedUser?.stripeConnectAccount)
    return next("User's Stripe Connect account not found");

  const token = new AuthToken(req._authenticatedUser as FixitApiAuthTokenPayloadUserData);

  res.json({
    token: token.toString(),
    // If req includes pre-fetched WOs/Invoices/Contacts, attach them to response.
    ...(req?._userQueryItems && { userItems: req._userQueryItems }),
  });
});
