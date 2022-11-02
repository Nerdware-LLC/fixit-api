import express from "express";
import * as Sentry from "@sentry/node";
import { expressMiddleware } from "@apollo/server/express4";
import { ENV } from "@server/env";
import { apolloServer } from "./apolloServer";
import {
  corsMW,
  setSecureHttpHeaders,
  logReqReceived,
  validateGqlReqContext,
  errorHandler,
  handle404
} from "./middleware";
import {
  adminRouter,
  authRouter,
  connectRouter,
  subscriptionsRouter,
  webhooksRouter
} from "./routers";

export const expressApp = express();

// The request handler must be the first middleware on the app
expressApp.use(Sentry.Handlers.requestHandler());

// LOG ALL REQUESTS IN DEV
if (!ENV.IS_PROD) {
  expressApp.use(logReqReceived);
}

// SECURITY
expressApp.use(corsMW, setSecureHttpHeaders);

/* API root path is /api (e.g., https://gofixit.app/api)

  Routing behavior:
    - /api    Go to apolloServer
    - /api/*  Use Express routes
*/

// BODY-PARSING
expressApp.use(["/api/auth", "/api/connect", "/api/subscriptions"], express.json());
expressApp.use("/api/webhooks", express.raw({ type: "application/json" }));

// EXPRESS ROUTE HANDLERS
expressApp.get("/api/admin/*", adminRouter);
expressApp.use("/api/auth", authRouter);
expressApp.use("/api/connect", connectRouter);
expressApp.use("/api/subscriptions", subscriptionsRouter);
expressApp.use("/api/webhooks", webhooksRouter);

// APOLLO SERVER (root path: /api)
expressApp.use(
  "/api",
  express.json(),
  expressMiddleware(apolloServer, {
    context: validateGqlReqContext
  })
);

// The error handler must be before any other error middleware and after all controllers
expressApp.use(Sentry.Handlers.errorHandler());

// HANDLE NON-EXISTENT REQUEST ROUTES
expressApp.use(handle404);

// UNIVERSAL ERROR HANDLER
expressApp.use(errorHandler);
