import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { AuthError } from "@/utils/httpErrors";
import { passwordHasher } from "@/utils/passwordHasher";
import type { RestApiRequestBodyByPath } from "@/types/open-api";

/**
 * This middleware checks if the authenticated User's login type is "LOCAL",
 * and if so, compares the provided password against the passwordHash stored
 * in the db. If it's invalid, an AuthError is thrown.
 */
export const validatePassword = mwAsyncCatchWrapper<RestApiRequestBodyByPath["/auth/login"]>(
  async (req, res, next) => {
    const userItem = res.locals?.user;

    if (!userItem) return next("User not found");

    if (userItem.login.type === "LOCAL") {
      // Ensure password was provided
      if (!("password" in req.body) || !req.body.password)
        return next(new AuthError("Password is required"));

      const isValidPassword = await passwordHasher.validate(
        req.body.password,
        userItem.login.passwordHash
      );

      if (isValidPassword === true) {
        /* Note: res.locals.user does not have `subscription`/`stripeConnectAccount` fields.
        For `generateAuthToken`, these fields are obtained from the `queryUserItems` mw. */
        res.locals.authenticatedUser = userItem;
      } else {
        next(new AuthError("Invalid email or password"));
      }
    }

    next();
  }
);
