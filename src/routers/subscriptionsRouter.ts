import express from "express";
import { isValidStripeID } from "@/lib/stripe";
import {
  getUserFromAuthHeaderToken,
  findOrCreateStripeSubscription,
  generateAuthToken,
  createCustomerPortalLink,
} from "@/middleware";
import { sanitizeAndValidateRequestBody } from "@/middleware/helpers";
import { UserSubscription } from "@/models/UserSubscription";
import { hasKey, sanitize, isValid } from "@/utils";

/**
 * This router handles all `/api/subscriptions` request paths:
 * - `/api/subscriptions/submit-payment`
 * - `/api/subscriptions/customer-portal`
 */
export const subscriptionsRouter = express.Router();

subscriptionsRouter.use(getUserFromAuthHeaderToken);

subscriptionsRouter.post(
  "/submit-payment",
  sanitizeAndValidateRequestBody({
    requestBodySchema: {
      selectedSubscription: {
        required: true,
        type: "string",
        sanitize: sanitize.alphabetic,
        validate: (value) => {
          if (!hasKey(UserSubscription.PRICE_IDS, value as string)) {
            throw new Error("Invalid subscription");
          }
        },
      },
      paymentMethodID: {
        required: true,
        type: "string",
        sanitize: sanitize.id,
        validate: isValidStripeID.paymentMethod,
      },
      promoCode: {
        required: false,
        type: "string",
        sanitize: sanitize.id,
        validate: (value) => {
          if (!hasKey(UserSubscription.PROMO_CODES, value as string)) {
            throw new Error("Invalid promo code");
          }
        },
      },
    },
  }),
  findOrCreateStripeSubscription,
  generateAuthToken
);

subscriptionsRouter.post(
  "/customer-portal",
  sanitizeAndValidateRequestBody({
    requestBodySchema: {
      returnURL: {
        required: true,
        type: "string",
        sanitize: sanitize.url,
        validate: isValid.url,
      },
    },
  }),
  createCustomerPortalLink
);
