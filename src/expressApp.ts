import express from "express";
import type {} from "express";
import * as Sentry from "@sentry/node";
import { ENV } from "@server/env";
import {} from "graphql";
import { apolloServer } from "./apolloServer";
import {
  corsMW,
  setSecureHttpHeaders,
  logReqReceived,
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

// APOLLO SERVER
apolloServer.applyMiddleware({ app: expressApp, path: "/api" });

// SECURITY
expressApp.use(corsMW, setSecureHttpHeaders);

// BODY-PARSING
expressApp.use(["/auth", "/connect", "/subscriptions"], express.json());
expressApp.use("/webhooks", express.raw({ type: "application/json" }));

// EXPRESS ROUTE HANDLERS
expressApp.get("/admin/*", adminRouter);
expressApp.use("/auth", authRouter);
expressApp.use("/connect", connectRouter);
expressApp.use("/subscriptions", subscriptionsRouter);
expressApp.use("/webhooks", webhooksRouter);

// The error handler must be before any other error middleware and after all controllers
expressApp.use(Sentry.Handlers.errorHandler());

// HANDLE NON-EXISTENT REQUEST ROUTES
expressApp.use(handle404);

// UNIVERSAL ERROR HANDLER
expressApp.use(errorHandler);
