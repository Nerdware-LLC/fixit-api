import { AuthToken, catchMWwrapper, type FixitApiAuthTokenPayload } from "@utils";

export const generateAuthToken = catchMWwrapper((req, res, next) => {
  if (!req?._user) next("User not found");

  const token = new AuthToken(req._user as FixitApiAuthTokenPayload);

  res.json({
    token: token.toString(),
    // If req includes pre-fetched WOs/Invoices/Contacts, attach them to response.
    ...(!!req._userQueryItems && { userItems: req._userQueryItems })
  });
});
