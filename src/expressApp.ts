import { expressMiddleware } from "@apollo/server/express4";
import * as Sentry from "@sentry/node";
import express, { type Express } from "express";
import { apolloServer, getAuthenticatedApolloContext } from "@/apolloServer.js";
import {
  corsMW,
  setSecureHttpHeaders,
  logReqReceived,
  handle404,
  errorHandler,
} from "@/middleware";
import {
  adminRouter,
  authRouter,
  connectRouter,
  subscriptionsRouter,
  webhooksRouter,
} from "@/routes";
import { ENV } from "@/server/env";

/**
 * The express app for API REST requests as well as the GraphQL entry point.
 *
 * > - `view cache` is always disabled since this app doesn't return HTML
 * > - `X-Powered-By` header is always disabled for security
 * > - `trust proxy` is enabled in deployed envs so the correct IP can be logged (not the LB's)
 *
 * See https://expressjs.com/en/4x/api.html#app.settings.table
 */
export const expressApp = express()
  .disable("view cache")
  .disable("x-powered-by")
  .set("trust proxy", ENV.IS_DEPLOYED_ENV) as Express & {
  /** When called, this function mounts all middleware and route handlers for the express app. */
  setupMiddleware: () => void;
};

expressApp.setupMiddleware = () => {
  // SENTRY REQUEST-HANDLER (must be first middleware)
  expressApp.use(
    Sentry.Handlers.requestHandler({
      // Keys to be extracted from req object and attached to the Sentry scope:
      request: ["ip", "data", "headers", "method", "query_string", "url"],
      ip: true,
    })
  );

  // LOG ALL REQUESTS
  expressApp.use(logReqReceived);

  // SECURITY
  expressApp.use(corsMW, setSecureHttpHeaders);

  // BODY-PARSING (webhooks routes handle their own body parsing)
  expressApp.use(
    /^\/api\/?((?!webhooks)\w+)?/,
    express.json({
      type: ["application/json", "application/csp-report", "application/reports+json"],
    })
  );

  // REST ROUTE HANDLERS
  expressApp.use("/api/admin", adminRouter);
  expressApp.use("/api/auth", authRouter);
  expressApp.use("/api/connect", connectRouter);
  expressApp.use("/api/subscriptions", subscriptionsRouter);
  expressApp.use("/api/webhooks", webhooksRouter);

  // GRAPHQL API ENTRYPOINT (root path: /api)
  expressApp.use(
    "/api",
    expressMiddleware(apolloServer, {
      context: getAuthenticatedApolloContext,
    })
  );

  // SENTRY ERROR-HANDLER (must be before any other error-mw and after all controllers)
  expressApp.use(Sentry.Handlers.errorHandler());

  // HANDLE NON-EXISTENT REQUEST ROUTES
  expressApp.use(handle404);

  // UNIVERSAL FALLBACK ERROR HANDLER
  expressApp.use(errorHandler);
};
