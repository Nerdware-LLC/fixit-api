import { checkPromoCode } from "./checkPromoCode.js";
import { createCustomerBillingPortalLink } from "./createCustomerBillingPortalLink.js";
import { submitPayment } from "./submitPayment.js";

/**
 * This object contains request/response handlers for `/api/subscriptions/*` routes.
 */
export const SubscriptionsController = {
  checkPromoCode,
  createCustomerBillingPortalLink,
  submitPayment,
} as const;
