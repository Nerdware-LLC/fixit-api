export const STRIPE_WEBHOOK_ROUTES = ["/account", "/customer"] as const;

export type StripeWebhooksHandlerRoute = typeof STRIPE_WEBHOOK_ROUTES[number];
