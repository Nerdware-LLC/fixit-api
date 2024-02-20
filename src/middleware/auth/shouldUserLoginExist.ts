import { UserInputError, AuthError } from "@/utils/httpErrors";
import type { RestApiRequestHandler } from "@/middleware/helpers";
import type { RestApiRequestBodyByPath } from "@/types/open-api";

/**
 * This middleware asserts that a UserLogin _**should not**_ exist on the `res.locals` object.
 */
export const userLoginShouldNotExist: RestApiRequestHandler<
  RestApiRequestBodyByPath["/auth/register" | "/auth/login"]
> = (req, res, next) => {
  if (res.locals?.user?.login) {
    next(new UserInputError("An account already exists with the provided email address."));
  }

  next();
};

/**
 * This middleware asserts that a UserLogin _**should**_ exist, and the data for which has been
 * attached to the `res.locals` object.
 */
export const userLoginShouldExist: RestApiRequestHandler<
  RestApiRequestBodyByPath["/auth/register" | "/auth/login"]
> = (req, res, next) => {
  if (!res.locals?.user?.login) {
    next(new AuthError("User not found."));
  }

  next();
};
