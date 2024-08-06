import { getTypeSafeError, safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import express from "express";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { ENV } from "@/server/env";
import { logger } from "@/utils/logger.js";
import { StripeWebhooksController } from "./StripeWebhooksController";
import type { RequestHandler } from "express";
import type Stripe from "stripe";
import type { GetDataObjectTypeForEvent } from "./types.js";

/**
 * `handleStripeWebhooks` is a tuple containing two Express middleware functions:
 *
 * 1. The first middleware function parses the incoming request body as raw JSON
 *    as required by the Stripe API.
 *
 * 2. The second middleware function constructs, validates, and logs all Stripe
 *    webhook events. If the event is valid, it then looks for a handler for the
 *    event's `type` (e.g., `"customer.subscription.updated"`). If the event has
 *    a handler defined on the {@link StripeWebhooksController}, it is called
 *    with the event's `data.object` as its sole argument.
 *
 *    See the [StripeWebhooksController README](./StripeWebhooksController/README.md)
 *    for more info on how this API handles Stripe webhook events.
 */
export const handleStripeWebhooks: [RequestHandler, RequestHandler<never, unknown, Buffer>] = [
  express.raw({ type: "application/json" }),
  async (req, res, next) => {
    let event: Stripe.DiscriminatedEvent | undefined;

    try {
      // Construct Stripe event object
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"] as string | string[] | Buffer,
        ENV.STRIPE.WEBHOOKS_SECRET
      ) as Stripe.DiscriminatedEvent;
    } catch (err: unknown) {
      const error = getTypeSafeError(err);
      logger.stripe(error, "Webhook signature verification failed");
      res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (!event) return next(new Error("Stripe webook event object not found"));

    const eventHandler = StripeWebhooksController[event.type];

    /*
      If `eventHandler` is
        truthy    --> actionable event
        null      --> non-actionable event
        undefined --> unhandled event
    */

    // Log the webhook and its actionability
    logger.webhook(
      `Stripe webhook received: "${event.type}" ` +
        `(HANDLED: ${eventHandler !== undefined}, ACTIONABLE: ${!!eventHandler}) ` +
        `EVENT DATA: ${safeJsonStringify(event.data.object, null, 2)}`
    );

    // If an event handler exists, invoke it and acknowledge receipt of the event
    if (eventHandler) {
      await eventHandler(event.data.object as GetDataObjectTypeForEvent<typeof event.type>);
    }

    res.status(200).json({ received: true });
  },
];
