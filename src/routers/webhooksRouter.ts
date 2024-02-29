import express from "express";
import { handleStripeWebhookEvent } from "@/middleware/stripeWebhooks/index.js";

/**
 * This router handles all `/api/webhooks` request paths:
 * - `/api/webhooks/stripe`
 */
export const webhooksRouter = express.Router();

webhooksRouter.use(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhookEvent // prettier-ignore
);
