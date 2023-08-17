import dayjs from "dayjs";
import type Stripe from "stripe";

/**
 * Returns a mock Stripe Connect Login Link object.
 * @see https://stripe.com/docs/api/account/login_link
 */
export const mockStripeConnectLoginLink = (stripeConnectAccountID: string): Stripe.LoginLink => ({
  object: "login_link",
  created: dayjs().unix(),
  url: `https://connect.stripe.com/express/${stripeConnectAccountID}/3xlM9Ctj03Tw`,
});
