import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { usersCache } from "@/lib/cache/usersCache.js";
import { Contact, type ContactItem } from "@/models/Contact";
import { Invoice, type InvoiceItem } from "@/models/Invoice";
import { USER_SK_PREFIX_STR } from "@/models/User";
import { UserStripeConnectAccount as UserSCA } from "@/models/UserStripeConnectAccount";
import { UserSubscription, type UserSubscriptionItem } from "@/models/UserSubscription";
import { WorkOrder, type WorkOrderItem } from "@/models/WorkOrder";
import { skTypeGuards } from "@/models/_common/skTypeGuards.js";
import { ddbTable } from "@/models/ddbTable.js";
import { AuthError, InternalServerError } from "@/utils/httpErrors.js";
import { logger } from "@/utils/logger.js";
import type { UserItem } from "@/models/User";
import type { UserStripeConnectAccountItem } from "@/models/UserStripeConnectAccount";
import type { PreFetchedUserItems } from "@/types/open-api.js";

/**
 * ### UserService: queryUserItems
 *
 * This function queries/fetches/pre-fetches the following types of User items:
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
 * GQL schema typedefs. This fn formats the items accordingly.
 */
export const queryUserItems = async ({
  authenticatedUserID,
}: {
  authenticatedUserID: UserItem["id"];
}): Promise<{
  userItems: PreFetchedUserItems; //                         <-- Returned for delivery to front-end cache
  userStripeConnectAccount: UserStripeConnectAccountItem; // <-- Returned for Stripe-API data-refresh fn
  userSubscription: UserSubscriptionItem | null; //          <-- Returned for Stripe-API data-refresh fn
}> => {
  // We want to retrieve items of multiple types, so we don't use a Model-instance here.
  const response = await ddbTable.ddbClient.query({
    TableName: ddbTable.tableName,
    KeyConditionExpression: `pk = :userID AND sk BETWEEN :skStart AND :skEnd`,
    ExpressionAttributeValues: {
      ":userID": authenticatedUserID,
      ":skStart": `${USER_SK_PREFIX_STR}#${authenticatedUserID}`,
      ":skEnd": "~",
      // In utf8 byte order, tilde comes after numbers, upper+lowercase letters, #, and $.
    },
    Limit: 100, // <-- ensures users with many items don't experience a delayed response
  });

  const items = response.Items;

  // Sanity check: If no items were found, throw AuthError
  if (!Array.isArray(items) || items.length === 0) throw new AuthError("User does not exist");

  // Organize the raw/unaliased items
  const { rawSubscription, rawStripeConnectAccount, rawWorkOrders, rawInvoices, rawContacts } =
    items.reduce(
      (
        accum: {
          rawSubscription: UserSubscriptionItem | null;
          rawStripeConnectAccount: UserStripeConnectAccountItem | null;
          rawWorkOrders: Array<WorkOrderItem>;
          rawInvoices: Array<InvoiceItem>;
          rawContacts: Array<ContactItem>;
        },
        current
      ) => {
        // Use type-guards to determine the type of the current item, and add it to the appropriate accum field
        if (skTypeGuards.isUser(current)) return accum;
        else if (skTypeGuards.isContact(current)) accum.rawContacts.push(current);
        else if (skTypeGuards.isInvoice(current)) accum.rawInvoices.push(current);
        else if (skTypeGuards.isUserSubscription(current)) accum.rawSubscription = current;
        else if (skTypeGuards.isUserSCA(current)) accum.rawStripeConnectAccount = current;
        else if (skTypeGuards.isWorkOrder(current)) accum.rawWorkOrders.push(current);
        else logger.warn(
            `[queryUserItems] The following ITEM was returned by the "queryUserItems" DDB query, but ` +
            `no handler has been implemented for items of this type in the item-categorization reducer.
            — ITEM: ${safeJsonStringify(current, null, 2)}`
          ); // prettier-ignore

        return accum;
      },
      {
        rawSubscription: null,
        rawStripeConnectAccount: null,
        rawWorkOrders: [],
        rawInvoices: [],
        rawContacts: [],
      }
    );

  // Ensure the user's SCA was found
  if (!rawStripeConnectAccount)
    throw new InternalServerError("User's Stripe Connect Account not found");

  // Format the user's rawStripeConnectAccount object, assign it to returned `userStripeConnectAccount`
  const userStripeConnectAccount =
    UserSCA.processItemAttributes.fromDB<UserStripeConnectAccountItem>(rawStripeConnectAccount);

  // Format the user's subscription object (this may not exist if the user is not yet subscribed)
  const userSubscription = rawSubscription
    ? UserSubscription.processItemAttributes.fromDB<UserSubscriptionItem>(rawSubscription)
    : null;

  /* Note: workOrders' and invoices' createdByUserID and assignedToUserID fields are converted
  into createdBy and assignedTo objects with an "id" field, but no other createdBy/assignedTo
  fields can be provided here without fetching additional data on the associated users/contacts
  from either the db or usersCache. This function forgoes fetching the data since the client-
  side Apollo cache already handles fetching additional data as needed (_if_ it's needed), and
  fetching it here can delay auth request response times, especially if the authenticating user
  has a large number of workOrders/invoices. */

  const returnedUserItems: PreFetchedUserItems = {
    myWorkOrders: rawWorkOrders.reduce(
      (accum: PreFetchedUserItems["myWorkOrders"], rawWorkOrder) => {
        // Process workOrder from its raw internal shape:
        const { createdByUserID, assignedToUserID, ...workOrderFields } =
          WorkOrder.processItemAttributes.fromDB<WorkOrderItem>(rawWorkOrder);

        const workOrder = {
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
          // __typename, createdBy, and assignedTo fields are formatted for the GQL client cache:
          __typename: "WorkOrder" as const,
          createdBy: { id: createdByUserID },
          assignedTo: assignedToUserID ? { id: assignedToUserID } : null,
        };

        if (createdByUserID === authenticatedUserID) accum.createdByUser.push(workOrder);
        else if (assignedToUserID === authenticatedUserID) accum.assignedToUser.push(workOrder);
        else logger.warn(
            `[queryUserItems] The following WorkOrder was returned by the "queryUserItems" ` +
            `DDB query, but it was neither createdBy nor assignedTo the authenticated user.
            — AuthenticatedUserID: ${authenticatedUserID}
            — WorkOrderItem: ${safeJsonStringify(workOrder, null, 2)}`
          ); // prettier-ignore

        return accum;
      },
      { createdByUser: [], assignedToUser: [] }
    ),

    myInvoices: rawInvoices.reduce(
      (accum: PreFetchedUserItems["myInvoices"], rawInvoice) => {
        // Process invoice from its raw internal shape:
        const { createdByUserID, assignedToUserID, workOrderID, ...invoiceFields } =
          Invoice.processItemAttributes.fromDB<InvoiceItem>(rawInvoice);

        const invoice = {
          // Fields which are nullable/optional in GQL schema must be provided, default to null:
          stripePaymentIntentID: null,
          // invoice values override above defaults:
          ...invoiceFields,
          // __typename, createdBy, and assignedTo fields are formatted for the GQL client cache:
          __typename: "Invoice" as const,
          createdBy: { id: createdByUserID },
          assignedTo: { id: assignedToUserID },
          workOrder: workOrderID ? { id: workOrderID } : null,
        };

        if (createdByUserID === authenticatedUserID) accum.createdByUser.push(invoice);
        else if (assignedToUserID === authenticatedUserID) accum.assignedToUser.push(invoice);
        else logger.warn(
            `[queryUserItems] The following Invoice was returned by the "queryUserItems" ` +
            `DDB query, but it was neither createdBy nor assignedTo the authenticated user.
            — AuthenticatedUserID: ${authenticatedUserID}
            — WorkOrderItem: ${safeJsonStringify(invoice, null, 2)}`
          ); // prettier-ignore

        return accum;
      },
      { createdByUser: [], assignedToUser: [] }
    ),
    myContacts: rawContacts.map((rawContact) => {
      // Process contact from its raw internal shape:
      const contact = Contact.processItemAttributes.fromDB<ContactItem>(rawContact);

      // Fetch some additional data from the usersCache
      const {
        email = "", // These defaults shouldn't be necessary, but are included for type-safety
        phone = "",
        profile = { displayName: contact.handle }, // displayName defaults to handle if n/a
      } = usersCache.get(contact.handle) ?? {};

      return {
        __typename: "Contact" as const,
        id: contact.id,
        handle: contact.handle,
        email,
        phone,
        profile,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      };
    }),
  };

  return {
    userItems: returnedUserItems,
    userStripeConnectAccount,
    userSubscription,
  };
};
