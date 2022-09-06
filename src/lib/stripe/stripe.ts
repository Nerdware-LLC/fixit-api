import Stripe from "stripe";
import { ENV } from "@server/env";

export const stripe = new Stripe(ENV.STRIPE.SECRET_KEY, {
  apiVersion: "2022-08-01", // previous version: "2020-08-27"
  typescript: true
});
