import { createSubscription } from "./createSubscription.js";
import { extractClientSecret } from "./extractClientSecret.js";
import { normalizeStripeFields } from "./normalizeStripeFields.js";
import { refreshDataFromStripe } from "./refreshDataFromStripe.js";
import { validateSubscriptionStatus } from "./validateSubscriptionStatus.js";
import { processCheckoutPayment } from "../CheckoutService/processCheckoutPayment.js";

/**
 * #### UserSubscriptionService
 *
 * This object contains methods which implement business logic for UserSubscription operations.
 */
export const UserSubscriptionService = {
  createSubscription,
  processCheckoutPayment,
  refreshDataFromStripe,
  validateSubscriptionStatus,
  // HELPER METHODS:
  extractClientSecret,
  normalizeStripeFields,
};
