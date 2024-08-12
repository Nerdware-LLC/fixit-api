import { handleStripeWebhooks } from "./handleStripeWebhooks.js";

/**
 * This object contains request/response handlers for `/api/webhooks/*` routes.
 */
export const WebhooksController = {
  stripeWebhooks: handleStripeWebhooks,
} as const;
