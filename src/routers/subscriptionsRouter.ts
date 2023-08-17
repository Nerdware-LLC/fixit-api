import express from "express";
import {
  getUserFromAuthHeaderToken,
  findOrCreateStripeSubscription,
  generateAuthToken,
  createCustomerPortalLink,
} from "@middleware";
import { getRequestBodyValidatorMW } from "@middleware/helpers";
import { hasKey } from "@utils/typeSafety";

/**
 * This router handles all `/api/subscriptions` request paths:
 * - `/api/subscriptions/submit-payment`
 * - `/api/subscriptions/customer-portal`
 */
export const subscriptionsRouter = express.Router();

subscriptionsRouter.use(getUserFromAuthHeaderToken);

subscriptionsRouter.post(
  "/submit-payment",
  getRequestBodyValidatorMW(
    (reqBody) => hasKey(reqBody, "selectedSubscription") && hasKey(reqBody, "paymentMethodID")
  ),
  findOrCreateStripeSubscription,
  generateAuthToken
);

subscriptionsRouter.post(
  "/customer-portal",
  getRequestBodyValidatorMW((reqBody) => hasKey(reqBody, "returnURL")),
  createCustomerPortalLink
);
