import express from "express";
import {
  validateSubmitPaymentReqBody,
  getUserFromAuthHeaderToken,
  findOrCreateStripeSubscription,
  generateAuthToken,
  createCustomerPortalLink
} from "@middleware";

export const subscriptionsRouter = express.Router();

// req.baseUrl = "/subscriptions"

subscriptionsRouter.use(getUserFromAuthHeaderToken);

subscriptionsRouter.post(
  "/submit-payment",
  validateSubmitPaymentReqBody,
  findOrCreateStripeSubscription,
  generateAuthToken
);
subscriptionsRouter.get("/customer-portal", createCustomerPortalLink);
