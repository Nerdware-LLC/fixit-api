import { createSubscription } from "./createSubscription.js";
import { findUsersSubscription } from "./findUsersSubscription.js";
import { normalizeStripeFields } from "./normalizeStripeFields.js";
import { refreshDataFromStripe } from "./refreshDataFromStripe.js";

/**
 * #### UserSubscriptionService
 *
 * This object contains methods which implement business logic for User Subscription operations.
 */
export const UserSubscriptionService = {
  createSubscription,
  findUsersSubscription,
  normalizeStripeFields,
  refreshDataFromStripe,
};
