import { stripe } from "@/lib/stripe/stripeClient.js";
import type { AuthTokenPayload } from "@/types/open-api.js";

/**
 * ### AccountService: createCustomerBillingPortalLink
 *
 * @returns a Stripe BillingPortal.Session object.
 */
export const createCustomerBillingPortalLink = async ({
  authenticatedUser,
  returnURL,
}: {
  authenticatedUser: AuthTokenPayload;
  returnURL: string;
}) => {
  return await stripe.billingPortal.sessions.create({
    customer: authenticatedUser.stripeCustomerID,
    return_url: returnURL,
  });
};
