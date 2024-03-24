import { AuthToken } from "@/utils/AuthToken.js";
import { AuthError } from "@/utils/httpErrors.js";
import type { RestApiRequestHandler } from "@/middleware/helpers.js";

/**
 * This middleware generates an AuthToken for the authenticated User to be
 * included in the returned response. If the User is not found or the User's
 * Stripe Connect account is not found, an error message is passed to `next`.
 */
export const generateAuthToken: RestApiRequestHandler = (req, res, next) => {
  const { authenticatedUser } = res.locals;

  if (!authenticatedUser?.id) return next(new AuthError("User not found"));

  const authToken = new AuthToken(authenticatedUser);

  res.locals.authToken = authToken.toString();

  next();
};
