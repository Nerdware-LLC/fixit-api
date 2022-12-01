import { stripe } from "@lib/stripe";
import { ENV } from "@server/env";
import { catchAsyncMW } from "@utils/middlewareWrappers";
import type { UserType } from "@models";

// req.originalUrl = "/subscriptions/customer-portal"
export const createCustomerPortalLink = catchAsyncMW(async (req, res) => {
  const stripeLink = await stripe.billingPortal.sessions.create({
    customer: (req._user as UserType).stripeCustomerID,
    return_url: `${ENV.CONFIG.API_BASE_URL}/customer-portal`
  });

  res.json({ stripeLink });
});
