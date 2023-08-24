import { stripe } from "@/lib/stripe";
import { mwAsyncCatchWrapper } from "@/middleware/helpers";

/**
 * `req.originalUrl = "/api/subscriptions/customer-portal"`
 */
export const createCustomerPortalLink = mwAsyncCatchWrapper<{ body: { returnURL: string } }>(
  async (req, res, next) => {
    if (!req?._authenticatedUser) return next("User not found");

    const stripeLink = await stripe.billingPortal.sessions.create({
      customer: req._authenticatedUser.stripeCustomerID,
      return_url: req.body.returnURL,
    });

    res.json({ stripeLink: stripeLink.url });
  }
);
