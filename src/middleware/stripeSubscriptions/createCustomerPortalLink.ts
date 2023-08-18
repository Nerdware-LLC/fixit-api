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

    /* FIXME Ensure the webhooks listed at the link below are properly handled (these
    are the potential changes that may occur as a result of customer actions taken
    in the Stripe customer portal).

    https://stripe.com/docs/customer-management/integrate-customer-portal#webhooks
  */

    res.json({ stripeLink: stripeLink.url });
  }
);
