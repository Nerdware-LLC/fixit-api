import { stripe } from "@/lib/stripe/stripeClient.js";
import type { AuthTokenPayload } from "@/types/open-api.js";

/**
 * ### AccountService: createStripeConnectAccountLink
 *
 * The `url` of the returned object provides customers with a link to access
 * their dashboard/Stripe account.
 *
 * @returns a Stripe LoginLink object.
 */
export const createDashboardLink = async ({
  authenticatedUser,
}: {
  authenticatedUser: AuthTokenPayload;
}) => {
  return await stripe.accounts.createLoginLink(authenticatedUser.stripeConnectAccount.id);
};
