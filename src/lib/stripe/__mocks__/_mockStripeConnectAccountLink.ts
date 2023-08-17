import dayjs from "dayjs";
import type Stripe from "stripe";

/**
 * Returns a mock Stripe Connect Account Link object.
 * @see https://stripe.com/docs/api/account_links/object
 */
export const mockStripeConnectAccountLink = (
  stripeConnectAccountID: string
): Stripe.AccountLink => ({
  object: "account_link",
  created: dayjs().unix(),
  expires_at: dayjs().add(300, "seconds").unix(),
  url: `https://connect.stripe.com/setup/s/${stripeConnectAccountID}/xIONN0QVMYbQ`,
});
