import { connectAccountUpdated } from "./connectAccountUpdated.js";
import { customerSubscriptionDeleted } from "./customerSubscriptionDeleted.js";
import { customerSubscriptionUpdated } from "./customerSubscriptionUpdated.js";
import type Stripe from "stripe";
import type { StripeWebhookHandler } from "../types.js";

/**
 * This controller maps Stripe webhook event-names to their respective event-handlers.
 *
 * See the [StripeWebhooksController README](./README.md) for more info.
 */
export const StripeWebhooksController: {
  readonly [EventName in Stripe.DiscriminatedEvent.Type]?: StripeWebhookHandler<EventName> | null;
} = {
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
