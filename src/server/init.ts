import "./initSentry";
import "./processEventHandlers";
import "./logStartupInfo";
import "@events";

await import("./ensureDdbTableIsActive");
await import("./initCacheForUsersSearch");

/* The imports in this file achieve the following:

  sentry                   Initialize Sentry
  processHandlers          Initialize NodeJS process event handlers
  logStartupInfo           Logs fixit-api version and other runtime info
  @events                  Initialize EventEmitter and attach event listeners
  ensureDDBTableIsActive   Ensures the target DDB table is connected and configured
  initCacheForUsersSearch  Initialize the usersCache with all users from the DDB table

  NOTE: Dynamic import used to avoid resource-not-found DDB client errors.

*/
