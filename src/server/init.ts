import "./env";
import "./sentry";
import "./processEventHandlers";
import "./logStartupInfo";
import "./ensureDDBTableIsActive";
import "@events";

/* The imports in this file achieve the following:

  env                     Initialize the ENV object
  sentry                  Initialize Sentry
  processHandlers         Initialize NodeJS process event handlers
  logStartupInfo          Logs fixit-api version and other runtime info
  ensureDDBTableIsActive  Ensures the target DDB table is connected and configured
  @events                 Initialize EventEmitter and attach event listeners

*/
