import { checkPromoCode } from "./checkPromoCode.js";
import { processCheckoutPayment } from "./processCheckoutPayment.js";

/**
 * #### CheckoutService
 *
 * This object contains methods which implement business logic related to
 * the checkout process.
 */
export const CheckoutService = {
  checkPromoCode,
  processPayment: processCheckoutPayment,
} as const;
