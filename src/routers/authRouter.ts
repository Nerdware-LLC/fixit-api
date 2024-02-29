import {
  sanitizeHandle,
  isValidHandle,
  sanitizePhone,
  isValidPhone,
  sanitizeEmail,
  isValidEmail,
  sanitizePassword,
  isValidPassword,
  sanitizeID,
  isValidID,
  sanitizeToken,
  isValidToken,
} from "@nerdware/ts-string-helpers";
import { hasKey, hasKeys } from "@nerdware/ts-type-safety-utils";
import express from "express";
import { sanitizeAndValidateRequestBody } from "@/middleware/helpers.js";
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
} from "@/middleware/index.js";
import type { RequestBodyFieldsSchema, RequestBodyValidatorFn } from "@/middleware/helpers.js";

/**
 * This router handles all `/api/auth` request paths:
 * - `/api/auth/register`
 * - `/api/auth/login`
 * - `/api/auth/token`
 */
export const authRouter = express.Router();

/**
 * A {@link RequestBodyFieldsSchema} that configures sanitzation and
 * validation for request body parameters used in auth routes.
 */
export const LOGIN_REQ_BODY_FIELDS_SCHEMA: RequestBodyFieldsSchema = {
  email: {
    required: true,
    type: "string",
    sanitize: sanitizeEmail,
    validate: isValidEmail,
  },
  password: {
    required: false,
    type: "string",
    sanitize: sanitizePassword,
    validate: isValidPassword,
  },
  googleID: {
    required: false,
    type: "string",
    sanitize: sanitizeID,
    validate: isValidID,
  },
  googleAccessToken: {
    required: false,
    type: "string",
    sanitize: sanitizeToken,
    validate: isValidToken,
  },
} as const;

/**
 * A {@link RequestBodyValidatorFn} that asserts that the request body
 * contains either a password or a Google OAuth ID and access token.
 */
export const requirePasswordOrGoogleOAuth: RequestBodyValidatorFn = (reqBody) => {
  if (!hasKey(reqBody, "password") && !hasKeys(reqBody, ["googleID", "googleAccessToken"])) {
    throw new Error("Invalid registration credentials");
  }
};

authRouter.use(
  "/register",
  sanitizeAndValidateRequestBody({
    requestBodySchema: {
      ...LOGIN_REQ_BODY_FIELDS_SCHEMA,
      handle: {
        required: true,
        type: "string",
        sanitize: sanitizeHandle,
        validate: isValidHandle,
      },
      phone: {
        required: true,
        type: "string",
        sanitize: sanitizePhone,
        validate: isValidPhone,
      },
    },
    validateRequestBody: requirePasswordOrGoogleOAuth,
  }),
  findUserByEmail,
  userLoginShouldNotExist,
  registerNewUser
);

authRouter.use(
  "/login",
  sanitizeAndValidateRequestBody({
    requestBodySchema: LOGIN_REQ_BODY_FIELDS_SCHEMA,
    validateRequestBody: requirePasswordOrGoogleOAuth,
  }),
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
