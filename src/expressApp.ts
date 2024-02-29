import { expressMiddleware } from "@apollo/server/express4";
import * as Sentry from "@sentry/node";
import express from "express";
import { apolloServer } from "@/apolloServer.js";
import {
  corsMW,
  errorHandler,
  handle404,
  logReqReceived,
  sendRESTJsonResponse,
  setSecureHttpHeaders,
  validateGqlReqContext,
} from "@/middleware/index.js";
import {
  adminRouter,
  authRouter,
  connectRouter,
  subscriptionsRouter,
  webhooksRouter,
} from "@/routers/index.js";

export const expressApp = express();

// SENTRY REQUEST-HANDLER (must be first middleware)
expressApp.use(Sentry.Handlers.requestHandler());

// LOG ALL REQUESTS
expressApp.use(logReqReceived);

// SECURITY
expressApp.use(corsMW, setSecureHttpHeaders);

// BODY-PARSING (admin and webhooks routers handle their own body parsing)
expressApp.use([/^\/api$/, /^\/api\/(auth|connect|subscriptions)/], express.json());

// REST ROUTE HANDLERS
expressApp.use("/api/admin", adminRouter);
expressApp.use("/api/auth", authRouter);
expressApp.use("/api/connect", connectRouter);
expressApp.use("/api/subscriptions", subscriptionsRouter);
expressApp.use("/api/webhooks", webhooksRouter);

// REST RESPONSE HANDLER (admin and webhooks routers handle their own responses)
expressApp.use(/^\/api\/(auth|connect|subscriptions)/, sendRESTJsonResponse);

// APOLLO SERVER (root path: /api)
expressApp.use(
  "/api",
  expressMiddleware(apolloServer, {
    context: validateGqlReqContext,
  })
);

// SENTRY ERROR-HANDLER (must be before any other error-mw and after all controllers)
expressApp.use(Sentry.Handlers.errorHandler());

// HANDLE NON-EXISTENT REQUEST ROUTES
expressApp.use(handle404);

// UNIVERSAL FALLBACK ERROR HANDLER
expressApp.use(errorHandler);
