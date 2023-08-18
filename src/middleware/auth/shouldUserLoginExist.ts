import { UserInputError, AuthError } from "@/utils";
import type { RequestHandler } from "express";

/**
 * This middleware asserts that a User-login _**should not**_ exist on the request object.
 *
 * Used on paths:
 * - "/register"
 */
export const userLoginShouldNotExist: RequestHandler = (req, res, next) => {
  if (req?._user?.login) {
    next(new UserInputError("An account already exists with the provided email address."));
  }

  next();
};

/**
 * This middleware asserts that a User-login _**should**_ exist, and the data for which
 * has been attached to the request object.
 *
 * Used on paths:
 * - "/login"
 */
export const userLoginShouldExist: RequestHandler = (req, res, next) => {
  if (!req?._user?.login) {
    next(new AuthError("User not found."));
  }

  next();
};
