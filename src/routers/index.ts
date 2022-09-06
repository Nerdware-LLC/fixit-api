export { adminRouter } from "./adminRouter";
export { authRouter } from "./authRouter";
export { connectRouter } from "./connectRouter";
export { subscriptionsRouter } from "./subscriptionsRouter";
export { webhooksRouter } from "./webhooksRouter";

/*
  These top-level Express routes are defined in src/expressApp.js

  /api            Apollo GraphQL Server
  /admin/*        adminRouter (GET only)
  /auth           authRouter
  /connect        connectRouter
  /subscriptions  subscriptionsRouter
  /webhooks       webhooksRouter
*/
