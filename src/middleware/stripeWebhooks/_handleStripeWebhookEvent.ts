import { getTypeSafeError, safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { ENV } from "@/server/env";
import { logger } from "@/utils/logger.js";
import { connectAccountUpdated } from "./connectAccountUpdated.js";
import { customerSubscriptionDeleted } from "./customerSubscriptionDeleted.js";
import { customerSubscriptionUpdated } from "./customerSubscriptionUpdated.js";
import type { Request, Response, NextFunction } from "express";
import type Stripe from "stripe";

/**
 * This middleware constructs, validates, and logs all Stripe webhook events. If
 * the event is valid, it then looks for a handler for the event's `type` (e.g.,
 * `"customer.subscription.updated"`), and invokes the handler if one is found.
 *
 * - This API places each event-type into 1 of 3 categories:
 *
 *   1. _`actionable`_ events were registered with Stripe and have associated
 *      event-handlers.
 *
 *   2. _`non-actionable`_ events were registered with Stripe but do NOT have
 *      associated event-handlers, typically because they contain data that is
 *      not persisted by the Fixit back-end at this time.
 *
 *   3. _`unhandled`_ events have NOT been registered with Stripe and therefore
 *      are NOT expected to be received. If an unhandled event is received, it
 *      is logged as an error.
 */
export const handleStripeWebhookEvent = async (req: Request, res: Response, next: NextFunction) => {
  let event: Stripe.Event | undefined;

  try {
    // Construct Stripe event object
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"] as string | string[] | Buffer,
      ENV.STRIPE.WEBHOOKS_SECRET
    );
  } catch (err: unknown) {
    const error = getTypeSafeError(err);
    logger.stripe(error, "Webhook signature verification failed");
    res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (!event) return next("ERROR: Stripe webook event object not found");

  const eventHandler = STRIPE_WEBHOOK_EVENT_HANDLERS?.[event.type];

  /*
    If eventHandler is
      truthy    --> actionable event
      null      --> non-actionable event
      undefined --> unhandled event
  */

  // Log the webhook and its actionability
  logger.webhook(
    safeJsonStringify(
      {
        isActionableEvent: !!eventHandler,
        isHandledEvent: eventHandler !== undefined,
        eventType: event.type,
        eventObject: event.data.object,
      },
      null,
      2
    )
  );

  // If an event handler exists, invoke it and acknowledge receipt of the event
  if (eventHandler) {
    await eventHandler(event.data.object);
    res.json({ received: true });
  }

  next();
};

/**
 * A hash table mapping Stripe webhook events to event-handlers.
 *
 * - Each event handler takes the event's `data.object` as its sole argument.
 * - Each event handler is responsible for logging any errors it encounters.
 * - Events with function-handlers are considered _actionable_ events.
 * - Events with `null`-handlers are considered _non-actionable_ events.
 * - Events not included are considered _unhandled_ events.
 *
 * #### Customer Portal Events
 *
 * The events listed below may be triggered by actions taken by Customers in the Stripe-provided
 * customer portal. Descriptions of each event and the data contained in its `data.object` can be
 * found [here][stripe-portal-events].
 *
 * - `billing_portal.configuration.created`
 * - `billing_portal.configuration.updated`
 * - `billing_portal.session.created`
 * - `customer.subscription.deleted`
 * - `customer.subscription.paused`
 * - `customer.subscription.resumed`
 * - `customer.subscription.updated`
 * - `customer.tax_id.created`
 * - `customer.tax_id.deleted`
 * - `customer.tax_id.updated`
 * - `customer.updated`
 * - `payment_method.attached`
 * - `payment_method.detached`
 *
 * [stripe-portal-events]: https://stripe.com/docs/customer-management/integrate-customer-portal#webhooks
 */
const STRIPE_WEBHOOK_EVENT_HANDLERS: Record<string, ((dataObj: any) => Promise<void>) | null> = {
  "account.application.authorized": null,
  "account.application.deauthorized": null,
  "account.external_account.created": null,
  "account.external_account.deleted": null,
  "account.external_account.updated": null,
  "account.updated": connectAccountUpdated,
  "billing_portal.configuration.created": null,
  "billing_portal.configuration.updated": null,
  "billing_portal.session.created": null,
  "customer.subscription.created": customerSubscriptionUpdated,
  "customer.subscription.deleted": customerSubscriptionDeleted,
  "customer.subscription.paused": customerSubscriptionUpdated,
  "customer.subscription.pending_update_applied": customerSubscriptionUpdated,
  "customer.subscription.pending_update_expired": customerSubscriptionUpdated,
  "customer.subscription.resumed": customerSubscriptionUpdated,
  "customer.subscription.trial_will_end": customerSubscriptionUpdated,
  "customer.subscription.updated": customerSubscriptionUpdated,
  "customer.created": null,
  "customer.deleted": null,
  "customer.updated": null,
  "customer.discount.created": null,
  "customer.discount.deleted": null,
  "customer.discount.updated": null,
  "customer.source.created": null,
  "customer.source.deleted": null,
  "customer.source.expiring": null,
  "customer.source.updated": null,
  "customer.tax_id.created": null,
  "customer.tax_id.deleted": null,
  "customer.tax_id.updated": null,
  "payment_method.attached": null,
  "payment_method.detached": null,
};
