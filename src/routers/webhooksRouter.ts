import express from "express";
import type { Request, Response, NextFunction } from "express";
import type Stripe from "stripe";
import { stripe, StripeWebhooksHandler, type StripeWebhooksHandlerRoute } from "@lib/stripe";
import { logger, catchAsyncMW, getTypeSafeErr, type StripeWebhookRequestObject } from "@utils";

export const webhooksRouter = express.Router();

// req.baseUrl = "/api/webhooks"

// For any and all /webhooks requests, try to validate and log the Stripe webhook event.
webhooksRouter.use((req: Request, res: Response, next: NextFunction) => {
  try {
    // Get Stripe event object
    let event: Stripe.Event;

    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"] as string | string[] | Buffer,
      StripeWebhooksHandler.PATHS[req.path as StripeWebhooksHandlerRoute].secret
    );

    // Log the webhook and its actionability
    logger.webhook(
      // prettier-ignore
      StripeWebhooksHandler.EVENT_ACTIONABILITY_LOG_PREFIX?.[event.type] ?? "(Unhandled Webhook Event)",
      event.type,
      event.data.object
    );

    // Attach event to req object
    (req as StripeWebhookRequestObject).event = event;
    next();
    //
  } catch (error: ErrorLike) {
    const safeErr = getTypeSafeErr(error);
    logger.stripe(error, "Webhook signature verification failed");
    res.status(400).send(`Webhook Error: ${safeErr.message}`);
  }
});

// For each handled webhook request path, run actionable event handlers.
Object.entries(StripeWebhooksHandler.PATHS).forEach(([webhookReqPath, webhookPathConfig]) => {
  webhooksRouter.post(
    webhookReqPath,
    catchAsyncMW<StripeWebhookRequestObject>(async ({ event }, res, next) => {
      // Ensure we have the Stripe event object
      if (!event) next("ERROR: req.event NOT FOUND IN PATH /webhooks");
      // Get the event handler (will be undefined for nonactionable/unhandled events)
      const eventHandler = webhookPathConfig.actionableEventHandlers?.[event.type];

      if (eventHandler) {
        await eventHandler(event.data.object);
        // Return a response to acknowledge receipt of the event
        res.json({ received: true });
      }

      next();
    })
  );
});
