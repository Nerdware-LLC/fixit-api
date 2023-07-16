import { expressMiddleware } from "@apollo/server/express4";
import * as Sentry from "@sentry/node";
import express from "express";
import { ENV } from "@server/env";
import { createApolloServer } from "./createApolloServer";
import {
  corsMW,
  setSecureHttpHeaders,
  logReqReceived,
  validateGqlReqContext,
  errorHandler,
  handle404,
} from "./middleware";
import {
  adminRouter,
  authRouter,
  connectRouter,
  subscriptionsRouter,
  webhooksRouter,
} from "./routers";

export const expressApp = express();

// Create an ApolloServer instance with the default Fixit schema
const apolloServer = await createApolloServer();

// SENTRY REQUEST-HANDLER (must be first middleware)
expressApp.use(Sentry.Handlers.requestHandler());

// LOG ALL REQUESTS IN DEV
if (!ENV.IS_PROD) expressApp.use(logReqReceived);

// SECURITY
expressApp.use(corsMW, setSecureHttpHeaders);

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
    context: validateGqlReqContext,
  })
);

// SENTRY ERROR-HANDLER (must be before any other error-mw and after all controllers)
expressApp.use(Sentry.Handlers.errorHandler());

// HANDLE NON-EXISTENT REQUEST ROUTES
expressApp.use(handle404);

// UNIVERSAL FALLBACK ERROR HANDLER
expressApp.use(errorHandler);
