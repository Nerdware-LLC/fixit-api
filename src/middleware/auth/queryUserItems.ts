import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { usersCache } from "@/lib/cache/usersCache.js";
import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import { Contact } from "@/models/Contact/Contact.js";
import { Invoice } from "@/models/Invoice/Invoice.js";
import { UserStripeConnectAccount } from "@/models/UserStripeConnectAccount/UserStripeConnectAccount.js";
import { UserSubscription } from "@/models/UserSubscription/UserSubscription.js";
import { WorkOrder } from "@/models/WorkOrder/WorkOrder.js";
import { skTypeGuards } from "@/models/_common/skTypeGuards.js";
import { ddbTable } from "@/models/ddbTable.js";
import { AuthError } from "@/utils/httpErrors.js";
import { logger } from "@/utils/logger.js";
import type { ContactItem } from "@/models/Contact/Contact.js";
import type { InvoiceItem } from "@/models/Invoice/Invoice.js";
import type { UserItem } from "@/models/User/User.js";
import type { UserStripeConnectAccountItem } from "@/models/UserStripeConnectAccount/UserStripeConnectAccount.js";
import type { UserSubscriptionItem } from "@/models/UserSubscription/UserSubscription.js";
import type { WorkOrderItem } from "@/models/WorkOrder/WorkOrder.js";

/**
 * This middleware function fetches/pre-fetches the following types of User items:
 *
 * - Subscription(s)      - used for authentication and authorization
 * - StripeConnectAccount - used for authentication and authorization
 * - Work Orders          - pre-fetched for the user's dashboard
 * - Invoices             - pre-fetched for the user's dashboard
 * - Contacts             - pre-fetched for the user's dashboard
 *
 * ### Items Formatted for the GQL Client Cache
 * On the client-side, these pre-fetched items are written into the Apollo client cache
 * by a request handler, and are therefore expected to be in the shape specified by the
 * GQL schema typedefs. This MW formats the items accordingly.
 *
 * ### Edge Case: _User not found_
 * If the User item is not found, this MW throws a 401 AuthError. This is unlikely to
 * occur in prod, since the client would have to have sent a valid JWT auth token without
 * existing in the db, but this *can* occur during development whenever a new empty
 * DDB-local table is instantiated and the client has retained an auth token from previous
 * interactions with the API.
 */
export const queryUserItems = mwAsyncCatchWrapper(async (req, res, next) => {
  if (!res.locals?.authenticatedUser) return next("User not found");

  // We want to retrieve items of multiple types, so we don't use a Model-instance here.
  const response = await ddbTable.ddbClient.query({
    TableName: ddbTable.tableName,
    KeyConditionExpression: `pk = :userID AND sk BETWEEN :skStart AND :skEnd`,
    ExpressionAttributeValues: {
      ":userID": res.locals.authenticatedUser.id,
      ":skStart": `#DATA#${res.locals.authenticatedUser.id}`,
      ":skEnd": "~",
      // In utf8 byte order, tilde comes after numbers, upper+lowercase letters, #, and $.
    },
    Limit: 100, // <-- ensures users with many items don't experience a delayed response
  });

  const items = response?.Items;

  // If no items were found, throw AuthError (see above jsdoc for details on this dev-env edge case)
  if (!Array.isArray(items) || items.length === 0) throw new AuthError("User does not exist");

  // Organize and format the items
  const { user, subscription, stripeConnectAccount, workOrders, invoices, contacts } = items.reduce(
    (
      accum: {
        user: UserItem | null;
        subscription: UserSubscriptionItem | null;
        stripeConnectAccount: UserStripeConnectAccountItem | null;
        workOrders: Array<WorkOrderItem>;
        invoices: Array<InvoiceItem>;
        contacts: Array<ContactItem>;
      },
      current
    ) => {
      // Use type-guards to determine the type of the current item, and add it to the appropriate accum field
      if (skTypeGuards.isContact(current)) accum.contacts.push(current);
      else if (skTypeGuards.isInvoice(current)) accum.invoices.push(current);
      else if (skTypeGuards.isUser(current)) accum.user = current;
      else if (skTypeGuards.isUserSubscription(current)) accum.subscription = current;
      else if (skTypeGuards.isUserStripeConnectAccount(current)) accum.stripeConnectAccount = current; // prettier-ignore
      else if (skTypeGuards.isWorkOrder(current)) accum.workOrders.push(current);
      else logger.warn(`[queryUserItems] The following ITEM was returned by the "queryUserItems" DDB query, but items of this type are not handled by the reducer. ${safeJsonStringify(current, null, 2)}`); // prettier-ignore

      return accum;
    },
    {
      user: null,
      subscription: null,
      stripeConnectAccount: null,
      workOrders: [],
      invoices: [],
      contacts: [],
    }
  );

  // If user was not found, throw AuthError (see above jsdoc for details on this dev-env edge case)
  if (!user) throw new AuthError("User does not exist");

  // Format the user's subscription object
  if (subscription) {
    const formattedSubItem =
      UserSubscription.processItemAttributes.fromDB<UserSubscriptionItem>(subscription);

    res.locals.authenticatedUser.subscription = formattedSubItem;
    res.locals.userSubscription = formattedSubItem;
  }

  // Format the user's stripeConnectAccount object
  if (stripeConnectAccount) {
    res.locals.authenticatedUser.stripeConnectAccount =
      UserStripeConnectAccount.processItemAttributes.fromDB<UserStripeConnectAccountItem>(
        stripeConnectAccount
      );
  }

  /* Note: workOrders' and invoices' createdByUserID and assignedToUserID fields are converted
  into createdBy and assignedTo objects with an "id" field, but no other createdBy/assignedTo
  fields can be provided here without fetching additional data on the associated users/contacts
  from either the db or usersCache. This middleware forgoes fetching the data since the client-
  side Apollo cache already handles fetching additional data as needed (_if_ it's needed), and
  fetching it here can delay auth request response times, especially if the authenticating user
  has a large number of workOrders/invoices. */

  res.locals.userItems = {
    ...(workOrders.length > 0 && {
      workOrders: workOrders.map((rawWorkOrder) => {
        // Process workOrder from its raw internal shape:
        const { createdByUserID, assignedToUserID, ...workOrderFields } =
          WorkOrder.processItemAttributes.fromDB<WorkOrderItem>(rawWorkOrder);

        return {
          // Fields which are nullable/optional in GQL schema must be provided, default to null:
          category: null,
          checklist: null,
          dueDate: null,
          entryContact: null,
          entryContactPhone: null,
          scheduledDateTime: null,
          contractorNotes: null,
          // workOrder values override above defaults:
          ...workOrderFields,
          // createdBy and assignedTo objects are formatted for the GQL client cache:
          createdBy: { id: createdByUserID },
          assignedTo: assignedToUserID ? { id: assignedToUserID } : null,
        };
      }),
    }),
    ...(invoices.length > 0 && {
      invoices: invoices.map((rawInvoice) => {
        // Process invoice from its raw internal shape:
        const { createdByUserID, assignedToUserID, workOrderID, ...invoiceFields } =
          Invoice.processItemAttributes.fromDB<InvoiceItem>(rawInvoice);

        return {
          // Fields which are nullable/optional in GQL schema must be provided, default to null:
          stripePaymentIntentID: null,
          // invoice values override above defaults:
          ...invoiceFields,
          // createdBy and assignedTo objects are formatted for the GQL client cache:
          createdBy: { id: createdByUserID },
          assignedTo: { id: assignedToUserID },
          workOrder: workOrderID ? { id: workOrderID } : null,
        };
      }),
    }),
    ...(contacts.length > 0 && {
      contacts: contacts.map((rawContact) => {
        // Process contact from its raw internal shape:
        const contact = Contact.processItemAttributes.fromDB<ContactItem>(rawContact);

        // Fetch some additional data from the usersCache
        const {
          email = "", // These defaults shouldn't be necessary, but are included for type-safety
          phone = "",
          profile = { displayName: contact.handle }, // displayName defaults to handle if n/a
        } = usersCache.get(contact.handle) ?? {};

        return {
          id: contact.id,
          handle: contact.handle,
          email,
          phone,
          profile,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
        };
      }),
    }),
  };

  next();
});
