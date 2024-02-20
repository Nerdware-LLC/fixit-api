import dayjs from "dayjs";
import type { UserItem } from "@/models/User";
import type Stripe from "stripe";

/**
 * Returns a mock Stripe Billing Portal Session object.
 * @see https://stripe.com/docs/api/customer_portal/session
 */
export const mockStripeBillingPortalSession = ({
  stripeCustomerID,
}: Pick<UserItem, "stripeCustomerID">): Stripe.BillingPortal.Session => ({
  object: "billing_portal.session",
  id: "bps_TestTestTest",
  configuration: "bpc_TestTestTest",
  created: dayjs().unix(),
  customer: stripeCustomerID,
  livemode: false,
  locale: null,
  on_behalf_of: null,
  return_url: "https://example.com/account",
  url: "https://billing.stripe.com/session/MOCK_SESSION_SECRET",
});
