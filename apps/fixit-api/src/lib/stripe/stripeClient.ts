import Stripe, { type Stripe as StripeTypeNamespace } from "stripe";
import { ENV } from "@/server/env";

if (!ENV.STRIPE.SECRET_KEY) {
  throw new Error("Unable to initialize Stripe client");
}

export const stripe = new Stripe(ENV.STRIPE.SECRET_KEY, {
  apiVersion: ENV.STRIPE.API_VERSION as StripeTypeNamespace.StripeConfig["apiVersion"],
  typescript: true,
  appInfo: {
    name: "fixit",
    ...(!!ENV.CONFIG.PROJECT_VERSION && {
      version: ENV.CONFIG.PROJECT_VERSION,
    }),
  },
});
