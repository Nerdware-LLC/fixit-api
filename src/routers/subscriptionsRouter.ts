import express from "express";
import {
  getUserFromAuthHeaderToken,
  validateSubmitPaymentReqBody,
  validateHasReturnURL,
  findOrCreateStripeSubscription,
  generateAuthToken,
  createCustomerPortalLink,
} from "@middleware";

export const subscriptionsRouter = express.Router();

// req.baseUrl = "/api/subscriptions"

subscriptionsRouter.use(getUserFromAuthHeaderToken);

subscriptionsRouter.post(
  "/submit-payment",
  validateSubmitPaymentReqBody,
  findOrCreateStripeSubscription,
  generateAuthToken
);

subscriptionsRouter.post("/customer-portal", validateHasReturnURL, createCustomerPortalLink);
