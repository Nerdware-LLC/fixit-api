import {
  sanitizeAlphabetic,
  isValidAlphabetic,
  sanitizeID,
  sanitizeURL,
  isValidURL,
} from "@nerdware/ts-string-helpers";
import express from "express";
import { pricesCache } from "@/lib/cache/pricesCache";
import { isValidStripeID } from "@/lib/stripe";
import {
  checkPromoCode,
  createCustomerPortalLink,
  findOrCreateStripeSubscription,
  generateAuthToken,
  getUserFromAuthHeaderToken,
} from "@/middleware";
import { sanitizeAndValidateRequestBody } from "@/middleware/helpers";
import { UserSubscription } from "@/models/UserSubscription";

/**
 * This router handles all `/api/subscriptions` request paths:
 * - `/api/subscriptions/check-promo-code`
 * - `/api/subscriptions/submit-payment`
 * - `/api/subscriptions/customer-portal`
 */
export const subscriptionsRouter = express.Router();

subscriptionsRouter.use(getUserFromAuthHeaderToken);

subscriptionsRouter.post(
  "/check-promo-code",
  sanitizeAndValidateRequestBody({
    requestBodySchema: {
      promoCode: {
        required: true,
        type: "string",
        sanitize: sanitizeAlphabetic,
        validate: isValidAlphabetic,
      },
    },
  }),
  checkPromoCode
);

subscriptionsRouter.post(
  "/submit-payment",
  sanitizeAndValidateRequestBody({
    requestBodySchema: {
      selectedSubscription: {
        required: true,
        type: "string",
        sanitize: sanitizeAlphabetic,
        validate: pricesCache.has,
      },
      paymentMethodID: {
        required: true,
        type: "string",
        sanitize: sanitizeID,
        validate: isValidStripeID.paymentMethod,
      },
      promoCode: {
        required: false,
        type: "string",
        sanitize: sanitizeAlphabetic,
        validate: UserSubscription.validatePromoCode,
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
        sanitize: sanitizeURL,
        validate: isValidURL,
      },
    },
  }),
  createCustomerPortalLink
);
