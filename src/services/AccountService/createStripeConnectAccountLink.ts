import { stripe } from "@/lib/stripe/stripeClient.js";
import type { AuthTokenPayload } from "@/types/open-api.js";

/**
 * ### AccountService: createStripeConnectAccountLink
 *
 * @returns a Stripe AccountLink object.
 */
export const createStripeConnectAccountLink = async ({
  authenticatedUser,
  returnURL,
}: {
  authenticatedUser: AuthTokenPayload;
  returnURL: string;
}) => {
  return await stripe.accountLinks.create({
    account: authenticatedUser.stripeConnectAccount.id,
    return_url: `${returnURL}?connect-return`,
    refresh_url: `${returnURL}?connect-refresh`,
    type: "account_onboarding",
  });
};
