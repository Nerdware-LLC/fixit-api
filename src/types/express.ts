import type { InvoiceModelItem } from "@/models/Invoice";
import type { UserModelItem } from "@/models/User";
import type { UserSubscriptionModelItem } from "@/models/UserSubscription";
import type { WorkOrderModelItem } from "@/models/WorkOrder";
import type { WorkOrder, Invoice, Contact } from "@/types";
import type { FixitApiAuthTokenPayload } from "@/utils/AuthToken";
import type { OverrideProperties, SetOptional } from "type-fest";

/**
 * A User's pre-fetched WorkOrders, Invoices, and Contacts (used on logins).
 * When fetched, these objects are made available on Express Request objects
 * as `req._userQueryItems`.
 */
export type PreFetchedUserQueryItems = {
  workOrders?: Array<
    OverrideProperties<WorkOrder, Pick<WorkOrderModelItem, "createdBy" | "assignedTo">>
  >;
  invoices?: Array<OverrideProperties<Invoice, Pick<InvoiceModelItem, "createdBy" | "assignedTo">>>;
  contacts?: Array<Contact>;
};

/**
 * This type contains all custom REST request-flow properties added to Express Request
 * objects by internal middleware. Each of these properties is globally available on the
 * Request object (see ambient merge-declaration in `src/types/Express.d.ts`).
 */
export type FixitRESTRequestFlowProperties = {
  /**
   * A User object from the database.
   */
  _user?: UserModelItem;

  /**
   * A UserSubscription object from the database (e.g., for sub-updating mw).
   */
  _userSubscription?: UserSubscriptionModelItem;

  /**
   * An AuthToken payload object from an authenticated request's auth token.
   */
  _authenticatedUser?: SetOptional<FixitApiAuthTokenPayload, "stripeConnectAccount">;

  /**
   * A User's pre-fetched WorkOrders, Invoices, and Contacts (used on logins).
   */
  _userQueryItems?: PreFetchedUserQueryItems;
};
