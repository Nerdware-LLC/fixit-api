import type { FixitRESTRequestFlowProperties } from "./express";

declare global {
  namespace Express {
    export interface Request {
      /**
       * A User object as extracted from the database.
       */
      _user?: FixitRESTRequestFlowProperties["_user"];

      /**
       * A UserSubscription object as extracted from the database (e.g., for sub-updating mw)
       */
      _userSubscription?: FixitRESTRequestFlowProperties["_userSubscription"];

      /**
       * An AuthToken payload object as extracted from the request's auth token.
       */
      _authenticatedUser?: FixitRESTRequestFlowProperties["_authenticatedUser"];

      /**
       * A User's pre-fetched WorkOrders, Invoices, and Contacts (used on logins).
       */
      _userQueryItems?: FixitRESTRequestFlowProperties["_userQueryItems"];
    }
  }
}
