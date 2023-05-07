import { ENV } from "@server/env";
import { connectAccountUpdated } from "./connectAccountUpdated";
import { customerSubscriptionDeleted } from "./customerSubscriptionDeleted";
import { customerSubscriptionUpdated } from "./customerSubscriptionUpdated";
import type { StripeWebhooksHandlerRoute } from "./routes";

export class StripeWebhooksHandler {
  static PATHS: Record<StripeWebhooksHandlerRoute, StripeWebhooksHandlerRouteConfig> = {
    "/account": {
      connect: true,
      actionableEventHandlers: {
        "account.updated": connectAccountUpdated,
      },
      nonActionableEvents: [
        "account.application.authorized",
        "account.application.deauthorized",
        "account.external_account.created",
        "account.external_account.deleted",
        "account.external_account.updated",
      ],
      secret: ENV.STRIPE.WEBHOOKS_SECRET,
    },
    "/customer": {
      actionableEventHandlers: {
        "customer.subscription.created": customerSubscriptionUpdated,
        "customer.subscription.updated": customerSubscriptionUpdated,
        "customer.subscription.pending_update_applied": customerSubscriptionUpdated,
        "customer.subscription.pending_update_expired": customerSubscriptionUpdated,
        "customer.subscription.trial_will_end": customerSubscriptionUpdated,
        "customer.subscription.deleted": customerSubscriptionDeleted,
      },
      nonActionableEvents: [
        "customer.created",
        "customer.deleted",
        "customer.updated",
        "customer.discount.created",
        "customer.discount.deleted",
        "customer.discount.updated",
        "customer.source.created",
        "customer.source.deleted",
        "customer.source.expiring",
        "customer.source.updated",
        "customer.tax_id.created",
        "customer.tax_id.deleted",
        "customer.tax_id.updated",
      ],
      secret: ENV.STRIPE.WEBHOOKS_SECRET,
    },
  };

  // This is used in webhooksRouter to quickly log event info
  // prettier-ignore
  static EVENT_ACTIONABILITY_LOG_PREFIX: Record<string, string> =
    Object.values(this.PATHS).reduce<Record<string, string>>(
      (accum, webhooksPathConfig) => {
        const { actionableEventHandlers, nonActionableEvents } = webhooksPathConfig;

        Object.keys(actionableEventHandlers).forEach((actionableEvent) => {
          accum[actionableEvent] = "(Actionable Event)";
        });

        nonActionableEvents.forEach((nonActionableEvent) => {
          accum[nonActionableEvent] = "(Non-Actionable Event)";
        });

        return accum;
      },
    {});
}

interface StripeWebhooksHandlerRouteConfig {
  connect?: boolean;
  actionableEventHandlers: Record<string, (...args: any[]) => Promise<void>>;
  nonActionableEvents: string[];
  secret: string;
}
