import {
  sanitizeHandle,
  isValidHandle,
  sanitizePhone,
  isValidPhone,
  sanitizeEmail,
  isValidEmail,
  sanitizePassword,
  isValidPassword,
} from "@nerdware/ts-string-helpers";
import { hasKey } from "@nerdware/ts-type-safety-utils";
import express from "express";
import {
  findUserByEmail,
  userLoginShouldExist,
  userLoginShouldNotExist,
  registerNewUser,
  validateLogin,
  getUserFromAuthHeaderToken,
  parseGoogleIDToken,
  updateExpoPushToken,
  queryUserItems,
  checkSubscriptionStatus,
  checkOnboardingStatus,
  generateAuthToken,
} from "@/middleware";
import { sanitizeAndValidateRequestBody } from "@/middleware/helpers.js";
import type { RequestBodyFieldsSchema, RequestBodyValidatorFn } from "@/middleware/helpers.js";

/**
 * This router handles all `/api/auth` request paths:
 * - `/api/auth/register`
 * - `/api/auth/login`
 * - `/api/auth/google-token`
 * - `/api/auth/token`
 */
export const authRouter = express.Router();

/**
 * A {@link RequestBodyFieldsSchema} that configures sanitzation and
 * validation for request body parameters used in auth routes.
 */
export const LOGIN_REQ_BODY_FIELDS_SCHEMA = {
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
  googleIDToken: {
    required: false,
    type: "string",
    // The Google JWT includes alphanumerics, as well as "-", ".", and "_" chars.
    // Note that in the below regex patterns, "-" is escaped so as to not create character ranges.
    sanitize: (value) => value.replace(/[^a-zA-Z0-9+/\-._=]/g, ""),
    validate: (value) => /^[a-zA-Z0-9+/\-._]+={0,3}$/.test(value),
  },
} as const satisfies RequestBodyFieldsSchema;

/**
 * A {@link RequestBodyValidatorFn} that asserts that the request body
 * contains either a password or Google OAuth2 ID token.
 */
export const requirePasswordOrGoogleOAuth: RequestBodyValidatorFn = (reqBody) => {
  if (!hasKey(reqBody, "password") && !hasKey(reqBody, "googleIDToken")) {
    throw new Error("Invalid registration credentials");
  }
};

authRouter.post(
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
        required: false,
        type: "string",
        sanitize: sanitizePhone,
        validate: isValidPhone,
      },
    },
    validateRequestBody: requirePasswordOrGoogleOAuth,
  }),
  parseGoogleIDToken, // does nothing for local-auth users
  findUserByEmail,
  userLoginShouldNotExist,
  registerNewUser
);

authRouter.post(
  "/login",
  sanitizeAndValidateRequestBody({
    requestBodySchema: LOGIN_REQ_BODY_FIELDS_SCHEMA,
    validateRequestBody: requirePasswordOrGoogleOAuth,
  }),
  parseGoogleIDToken, // does nothing for local-auth users
  findUserByEmail,
  userLoginShouldExist,
  validateLogin,
  queryUserItems,
  updateExpoPushToken,
  checkSubscriptionStatus,
  checkOnboardingStatus
);

authRouter.post(
  "/google-token",
  sanitizeAndValidateRequestBody({
    requestBodySchema: {
      googleIDToken: {
        ...LOGIN_REQ_BODY_FIELDS_SCHEMA.googleIDToken,
        required: true,
      },
    },
  }),
  parseGoogleIDToken,
  findUserByEmail,
  userLoginShouldExist,
  validateLogin,
  queryUserItems,
  updateExpoPushToken,
  checkSubscriptionStatus,
  checkOnboardingStatus
);

authRouter.post(
  "/token",
  getUserFromAuthHeaderToken,
  queryUserItems,
  updateExpoPushToken,
  checkSubscriptionStatus,
  checkOnboardingStatus
);

authRouter.use(generateAuthToken);
