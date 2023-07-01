import express from "express";
import { handleStripeWebhookEvent } from "@middleware/stripeWebhooks";

/**
 * This router handles all requests to the "/api/webhooks" path.
 *
 * - `req.baseUrl` = "/api/webhooks"
 *
 * Descendant paths:
 * - `/api/webhooks/stripe`
 */
export const webhooksRouter = express.Router();

// For all Stripe-webhook requests, the Stripe webhook event is logged and validated.
webhooksRouter.use("/stripe", handleStripeWebhookEvent);
