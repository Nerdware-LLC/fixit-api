import express from "express";
import { handleStripeWebhookEvent } from "@middleware/stripeWebhooks";

/**
 * This router handles all requests to the "/api/webhooks" path.
 *
 * - `req.baseUrl` = "/api/webhooks"
 *
 * Descendant paths:
 * - `/api/webhooks/stripe`
 *
 * // FIXME paths were /api/webhooks/account and /api/webhooks/customer
 * //       NOW it's /api/webhooks/stripe
 * //       UPDATE the path in Stripe dashboard
 */
export const webhooksRouter = express.Router();

// For all Stripe-webhook requests, the Stripe webhook event is validated and logged.
// TODO Once path is updated to /api/webhooks/stripe in Stripe dashboard, add path to this use-call
webhooksRouter.use(handleStripeWebhookEvent);
