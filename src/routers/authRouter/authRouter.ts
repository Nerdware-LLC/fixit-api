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
} from "@/middleware";
import { sanitizeAndValidateRequestBody } from "@/middleware/helpers";
import { sanitize, isValid } from "@/utils";
import { LOGIN_REQ_BODY_FIELDS_SCHEMA, requirePasswordOrGoogleOAuth } from "./reqBodySchema";

/**
 * This router handles all `/api/auth` request paths:
 * - `/api/auth/register`
 * - `/api/auth/login`
 * - `/api/auth/token`
 */
export const authRouter = express.Router();

authRouter.use(
  "/register",
  sanitizeAndValidateRequestBody({
    requestBodySchema: {
      ...LOGIN_REQ_BODY_FIELDS_SCHEMA,
      handle: {
        required: true,
        type: "string",
        sanitize: sanitize.handle,
        validate: isValid.handle,
      },
      phone: {
        required: true,
        type: "string",
        sanitize: sanitize.phone,
        validate: isValid.phone,
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
