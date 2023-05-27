import type {
  InternalDbWorkOrder,
  InternalDbInvoice,
  InternalDbContact,
  InternalDbUser,
} from "@types";
import type { FixitApiAuthTokenPayload } from "@utils/AuthToken";
import type { Stripe } from "stripe";

/**
 * A User's pre-fetched WorkOrders, Invoices, and Contacts (used on logins).
 * When fetched, these objects are made available on Express Request objects
 * as `req._userQueryItems`.
 */
export type PreFetchedUserQueryItems = {
  workOrders?: Array<InternalDbWorkOrder>;
  invoices?: Array<InternalDbInvoice>;
  contacts?: Array<InternalDbContact>;
};

/**
 * This type contains all custom properties this application adds to Express Request
 * objects. Each of these properties is globally available on the Request object (see
 * ambient merge-declaration in `src/types/Express.d.ts`).
 */
export type CustomRequestProperties = {
  /**
   * A User object as extracted from the database.
   */
  _user?: InternalDbUser;

  /**
   * An AuthToken payload object as extracted from the request's auth token.
   */
  _authenticatedUser?: FixitApiAuthTokenPayload;

  /**
   * A User's pre-fetched WorkOrders, Invoices, and Contacts (used on logins).
   */
  _userQueryItems?: PreFetchedUserQueryItems;

  /**
   * A Stripe-Webhook Event object.
   */
  event?: Stripe.Event;
};
