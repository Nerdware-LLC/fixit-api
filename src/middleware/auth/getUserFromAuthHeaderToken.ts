import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import { AuthToken } from "@/utils/AuthToken.js";
import { AuthError } from "@/utils/httpErrors.js";

/**
 * Authentication middleware that checks for a valid auth token in the request
 * header. If a valid token is found, the user's info is added to the request
 * object as `res.locals.authenticatedUser`.
 *
 * > _All authentication-required logic/features are placed after this mw._
 */
export const getUserFromAuthHeaderToken = mwAsyncCatchWrapper(async (req, res, next) => {
  res.locals.authenticatedUser = await AuthToken.getValidatedRequestAuthTokenPayload(req).catch(
    (err) => {
      throw new AuthError(err); // Re-throw as AuthError
    }
  );

  next();
});
