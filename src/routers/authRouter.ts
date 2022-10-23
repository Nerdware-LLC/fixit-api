import express from "express";
import {
  validateLoginReqBody,
  validateUserRegReqBody,
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
  generateAuthToken
} from "@middleware";

export const authRouter = express.Router();

// req.baseUrl = "/auth"
// TODO Add route "/auth/forgot-password"

authRouter.use(
  "/login",
  validateLoginReqBody,
  findUserByEmail,
  userLoginShouldExist,
  validatePassword,
  updateExpoPushToken,
  queryUserItems,
  checkSubscriptionStatus,
  checkOnboardingStatus
);
authRouter.use(
  "/register",
  validateUserRegReqBody,
  findUserByEmail,
  userLoginShouldNotExist,
  registerNewUser
);
authRouter.use(
  "/token",
  getUserFromAuthHeaderToken,
  updateExpoPushToken,
  queryUserItems,
  checkSubscriptionStatus,
  checkOnboardingStatus
);

authRouter.use(generateAuthToken);
