import { s3client } from "@lib/s3client";
import { ENV } from "@server/env";
import { InternalServerError } from "@utils";
import { connectAccountUpdated } from "./connectAccountUpdated";
import { customerSubscriptionUpdated } from "./customerSubscriptionUpdated";
import { customerSubscriptionDeleted } from "./customerSubscriptionDeleted";

// Get Stripe webhook secrets json file
const stripeWebhookSecretsFileStr = await s3client.getObject({
  // FIXME perms error on call to get this
  Bucket: ENV.STRIPE.WEBHOOK_SECRETS_BUCKET,
  Key: "stripeWebhookSecrets.json"
});

if (!stripeWebhookSecretsFileStr) {
  throw new InternalServerError("Failed to obtain Stripe webhook secrets");
}

const stripeWebhookSecrets = JSON.parse(stripeWebhookSecretsFileStr);

export class StripeWebhooksHandler {
  static PATHS: Record<StripeWebhooksHandlerRoute, StripeWebhooksHandlerRouteConfig> = {
    "/account": {
      connect: true,
      actionableEventHandlers: {
        "account.updated": connectAccountUpdated
      },
      nonActionableEvents: [
        "account.application.authorized",
        "account.application.deauthorized",
        "account.external_account.created",
        "account.external_account.deleted",
        "account.external_account.updated"
      ],
      secret: stripeWebhookSecrets["/account"]
    },
    "/customer": {
      actionableEventHandlers: {
        "customer.subscription.created": customerSubscriptionUpdated,
        "customer.subscription.updated": customerSubscriptionUpdated,
        "customer.subscription.pending_update_applied": customerSubscriptionUpdated,
        "customer.subscription.pending_update_expired": customerSubscriptionUpdated,
        "customer.subscription.trial_will_end": customerSubscriptionUpdated,
        "customer.subscription.deleted": customerSubscriptionDeleted
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
        "customer.tax_id.updated"
      ],
      secret: stripeWebhookSecrets["/customer"]
    }
  };

  // This is used in webhooksRouter to quickly log event info
  static EVENT_ACTIONABILITY_LOG_PREFIX: Record<string, string> = Object.values(this.PATHS).reduce(
    (accum, webhooksPathConfig) => {
      Object.keys(webhooksPathConfig.actionableEventHandlers).forEach((actionableEvent) => {
        Object.defineProperty(accum, actionableEvent, {
          value: "(Actionable Event)"
        });
      });

      webhooksPathConfig.nonActionableEvents.forEach((nonActionableEvent) => {
        Object.defineProperty(accum, nonActionableEvent, {
          value: "(Non-Actionable Event)"
        });
      });

      return accum;
    },
    {} // <-- init accumulator object
  );
}

export type StripeWebhooksHandlerRoute = "/account" | "/customer";
export interface StripeWebhooksHandlerRouteConfig {
  connect?: boolean;
  actionableEventHandlers: Record<string, (...args: any[]) => Promise<void>>;
  nonActionableEvents: string[];
  secret: string;
}
