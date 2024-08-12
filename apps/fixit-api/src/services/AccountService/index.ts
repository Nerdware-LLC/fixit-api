import { createCustomerBillingPortalLink } from "./createCustomerBillingPortalLink.js";
import { createDashboardLink } from "./createDashboardLink.js";
import { createStripeConnectAccountLink } from "./createStripeConnectAccountLink.js";

/**
 * #### AccountService
 *
 * This object contains methods which implement business logic related to
 * user account management.
 */
export const AccountService = {
  createCustomerBillingPortalLink,
  createDashboardLink,
  createStripeConnectAccountLink,
} as const;
