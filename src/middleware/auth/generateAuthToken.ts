import { mwCatchWrapper } from "@middleware/helpers";
import { AuthToken } from "@utils";
import type { FixitApiAuthTokenPayloadUserData } from "@utils";

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
