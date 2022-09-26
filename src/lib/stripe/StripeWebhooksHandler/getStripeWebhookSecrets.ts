import { s3client } from "@lib/s3client";
import { ENV } from "@server/env";
import { STRIPE_WEBHOOK_ROUTES, type StripeWebhooksHandlerRoute } from "./routes";

let stripeWebhookSecrets: { [K in StripeWebhooksHandlerRoute]: string };

if (/^(staging|prod)/i.test(ENV.NODE_ENV)) {
  // Get Stripe webhook secrets json file
  const stripeWebhookSecretsFileStr = await s3client.getObject({
    Bucket: ENV.STRIPE.WEBHOOK_SECRETS_BUCKET,
    Key: "stripeWebhookSecrets.json"
  });

  if (!stripeWebhookSecretsFileStr) throw new Error("Failed to obtain Stripe webhook secrets.");

  stripeWebhookSecrets = JSON.parse(stripeWebhookSecretsFileStr);
  //
} else if (/^(dev|test)/i.test(ENV.NODE_ENV)) {
  // In dev/test envs, all webhook routes use the same "test" wh-secret value
  stripeWebhookSecrets = {
    "/account": ENV.STRIPE.WEBHOOKS_SECRET,
    "/customer": ENV.STRIPE.WEBHOOKS_SECRET
  };
} else {
  throw new Error(`(getStripeWebhookSecrets) No handler exists for env "${ENV.NODE_ENV}".`);
}

// Ensure all required routes have a secret before exporting
STRIPE_WEBHOOK_ROUTES.every((route) => route in stripeWebhookSecrets);

export { stripeWebhookSecrets };
