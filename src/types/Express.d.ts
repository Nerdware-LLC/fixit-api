import type { CustomRequestProperties } from "./express";

declare global {
  namespace Express {
    export interface Request {
      /**
       * A User object as extracted from the database.
       */
      _user?: CustomRequestProperties["_user"];

      /**
       * A UserSubscription object as extracted from the database (e.g., for sub-updating mw)
       */
      _userSubscription?: CustomRequestProperties["_userSubscription"];

      /**
       * An AuthToken payload object as extracted from the request's auth token.
       */
      _authenticatedUser?: CustomRequestProperties["_authenticatedUser"];

      /**
       * A User's pre-fetched WorkOrders, Invoices, and Contacts (used on logins).
       */
      _userQueryItems?: CustomRequestProperties["_userQueryItems"];
    }
  }
}
