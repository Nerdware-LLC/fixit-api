import type { CustomRequestProperties } from "./express";

export {};

declare global {
  namespace Express {
    export interface Request {
      /**
       * A User object as extracted from the database.
       */
      _user?: CustomRequestProperties["_user"];

      /**
       * An AuthToken payload object as extracted from the request's auth token.
       */
      _authenticatedUser?: CustomRequestProperties["_authenticatedUser"];

      /**
       * A User's pre-fetched WorkOrders, Invoices, and Contacts (used on logins).
       */
      _userQueryItems?: CustomRequestProperties["_userQueryItems"];

      /**
       * A Stripe-Webhook Event object.
       */
      event?: CustomRequestProperties["event"];
    }
  }
}
