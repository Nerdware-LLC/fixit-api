import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import { AuthError, InternalServerError } from "@/utils/httpErrors.js";
import { passwordHasher } from "@/utils/passwordHasher.js";
import type { CombineUnionOfObjects } from "@/types/helpers.js";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";

/**
 * This middleware validates User's Login objects.
 *
 * - If the User's login type is `"LOCAL"`, it compares the provided password
 *   against the passwordHash stored in the db.
 *
 * - If the User's login type is `"GOOGLE_OAUTH"`, it checks the value of
 *   `res.locals.googleIDTokenFields?._isValid`, which is set by the `parseGoogleIDToken`
 *   middleware.
 *
 * If it's invalid, an AuthError is thrown.
 */
export const validateLogin = mwAsyncCatchWrapper<
  CombineUnionOfObjects<RestApiRequestBodyByPath["/auth/login"]>
>(async (req, res, next) => {
  const userItem = res.locals?.user;

  if (!userItem) return next(new AuthError("User not found"));

  // LOCAL LOGIN — validate password
  if (userItem.login.type === "LOCAL") {
    // Ensure password was provided
    if (!req.body?.password) return next(new AuthError("Password is required"));

    const isValidPassword = await passwordHasher.validate(
      req.body.password,
      userItem.login.passwordHash
    );

    if (!isValidPassword) next(new AuthError("Invalid email or password"));

    /* Note: res.locals.user does not have `subscription`/`stripeConnectAccount` fields.
    For `generateAuthToken`, these fields are obtained from the `queryUserItems` mw. */
    res.locals.authenticatedUser = userItem;

    // GOOGLE_OAUTH LOGIN — check res.locals.googleIDTokenFields._isValid
  } else if (userItem.login.type === "GOOGLE_OAUTH") {
    // The parseGoogleIDToken mw provides this res.locals field, check `_isValid`. The
    // field should always be true here, else the fn would throw, but it provides clarity.
    if (res.locals.googleIDTokenFields?._isValid) res.locals.authenticatedUser = userItem;
  } else {
    next(new InternalServerError("Invalid login"));
  }

  next();
});
