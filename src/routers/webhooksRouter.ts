import express, { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { stripe, StripeWebhooksHandler, type StripeWebhooksHandlerRoute } from "@lib/stripe";
import { logger, catchAsyncMW, getTypeSafeErr } from "@utils";

export const webhooksRouter = express.Router();

// req.baseUrl = "/webhooks"

// For any and all /webhooks requests, try to validate and log the Stripe webhook event.
webhooksRouter.use((req: Request, res: Response, next: NextFunction) => {
  let event: Stripe.Event;

  try {
    // Get Stripe event object

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
    Object.defineProperty(req, "event", { value: event });
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
    catchAsyncMW(async ({ event }: RequestWithEvent, res: Response, next: NextFunction) => {
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

interface RequestWithEvent extends Request {
  event: Stripe.Event;
}
