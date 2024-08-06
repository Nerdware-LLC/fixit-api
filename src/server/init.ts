import "./initSentry.js";
import "./processEventHandlers.js";
import "./logStartupInfo.js";

/* The side-effect imports in this file achieve the following:

  sentry            Initialize Sentry
  processHandlers   Initialize NodeJS process event handlers
  logStartupInfo    Logs fixit-api version and other runtime info
*/
