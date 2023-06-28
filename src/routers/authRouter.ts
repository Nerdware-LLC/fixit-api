import express from "express";
import {
  findUserByEmail,
  userLoginShouldExist,
  userLoginShouldNotExist,
  registerNewUser,
  validatePassword,
  getUserFromAuthHeaderToken,
  updateExpoPushToken,
  queryUserItems,
  checkSubscriptionStatus,
  checkOnboardingStatus,
  generateAuthToken,
} from "@middleware";
import { getRequestBodyValidatorMW } from "@middleware/helpers";
import { hasKey } from "@utils/typeSafety";

/**
 * This router handles all requests to the "/api/auth" path.
 *
 * - `req.baseUrl` = "/api/auth"
 *
 * Descendant paths:
 * - `/api/auth/register`
 * - `/api/auth/login`
 * - `/api/auth/token`
 */
export const authRouter = express.Router();

// TODO Add route "/auth/forgot-password"

authRouter.use(
  "/register",
  getRequestBodyValidatorMW(
    (reqBody) =>
      ["handle", "email", "phone"].every((key) => hasKey(reqBody, key)) &&
      hasValidLoginKeys(reqBody)
  ),
  findUserByEmail,
  userLoginShouldNotExist,
  registerNewUser
);
authRouter.use(
  "/login",
  getRequestBodyValidatorMW((reqBody) => hasKey(reqBody, "email") && hasValidLoginKeys(reqBody)),
  findUserByEmail,
  userLoginShouldExist,
  validatePassword,
  queryUserItems,
  updateExpoPushToken,
  checkSubscriptionStatus,
  checkOnboardingStatus
);
authRouter.use(
  "/token",
  getUserFromAuthHeaderToken,
  queryUserItems,
  updateExpoPushToken,
  checkSubscriptionStatus,
  checkOnboardingStatus
);

authRouter.use(generateAuthToken);

/**
 * This function checks `req.body` for login-related keys; the exact keys required
 * depend on the login "type".
 */
const hasValidLoginKeys = (reqBody: Record<string, unknown>): boolean => {
  return (
    hasKey(reqBody, "type") &&
    (reqBody.type === "LOCAL"
      ? hasKey(reqBody, "password")
      : reqBody.type === "GOOGLE_OAUTH"
      ? hasKey(reqBody, "googleID") && hasKey(reqBody, "googleAccessToken")
      : false)
  );
};
