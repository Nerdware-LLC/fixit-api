import { usersCache } from "@lib/cache";
import { mwAsyncCatchWrapper } from "@middleware/helpers";
import {
  skTypeGuards,
  UserSubscription,
  UserStripeConnectAccount,
  WorkOrder,
  Invoice,
  Contact,
} from "@models";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { logger, AuthError } from "@utils";
import type { ContactModelItem } from "@models/Contact";
import type { InvoiceModelItem } from "@models/Invoice";
import type { UserModelItem } from "@models/User";
import type { UserStripeConnectAccountModelItem } from "@models/UserStripeConnectAccount";
import type { UserSubscriptionModelItem } from "@models/UserSubscription";
import type { WorkOrderModelItem } from "@models/WorkOrder";

/**
 * This middleware function obtains a User's StripeConnectAccount and Subscription(s).
 * Since this necessitates a DB query, the query executed here also obtains the User
 * Items listed below to pre-fetch data that will be used upon successful login.
 *
 * - Subscription(s)
 * - StripeConnectAccount
 * - Work Orders
 * - Invoices
 * - Contacts
 *
 * Edge Case: If the User item is not found, this MW throws a 401 AuthError. This is
 * unlikely to occur in prod, since the client would have to have sent a valid JWT
 * auth token without existing in the db, but this *does* occur during development
 * whenever a new empty DDB-local table is instantiated and the client has retained
 * an auth token from previous interactions with the API.
 */
export const queryUserItems = mwAsyncCatchWrapper(async (req, res, next) => {
  if (!req?._authenticatedUser) return next("User not found");

  // We want to retrieve multiple item-types, so we don't use a Model-instance here.
  const items = await ddbSingleTable.ddbClient.query({
    where: {
      pk: req._authenticatedUser.id,
      sk: {
        between: [
          `#DATA#${req._authenticatedUser.id}`,
          "~", // In utf8 byte order, tilde comes after numbers, upper+lowercase letters, #, and $.
        ],
      },
    },
    // KeyConditionExpression: "pk = :userID AND sk BETWEEN :userSK AND :tilde",
    // ExpressionAttributeValues: {
    //   ":userID": req._authenticatedUser.id,
    //   ":userSK": `#DATA#${req._authenticatedUser.id}`,
    //   ":tilde": "~",
    // },
  });

  // If no items were found, the user doesn't exist, throw AuthError (see above jsdoc for details on this edge case)
  if (!Array.isArray(items) || items.length === 0) throw new AuthError("User does not exist");

  // Organize and format the items
  const { user, subscription, stripeConnectAccount, workOrders, invoices, contacts } = items.reduce(
    (
      accum: {
        user: UserModelItem | null;
        subscription: UserSubscriptionModelItem | null;
        stripeConnectAccount: UserStripeConnectAccountModelItem | null;
        workOrders: Array<WorkOrderModelItem>;
        invoices: Array<InvoiceModelItem>;
        contacts: Array<ContactModelItem>;
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
      else logger.warn(`[queryUserItems] The following ITEM was returned by the "queryUserItems" DDB query, but items of this type are not handled by the reducer. ${JSON.stringify(current, null, 2)}`); // prettier-ignore

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

  // If user was not found, throw AuthError (see above jsdoc for details on this edge case)
  if (!user) throw new AuthError("User does not exist");

  if (subscription) {
    const formattedSubItem = UserSubscription.processItemData.fromDB(
      subscription
    ) as typeof subscription;

    req._authenticatedUser.subscription = formattedSubItem;
    req._userSubscription = formattedSubItem;
  }

  if (stripeConnectAccount) {
    req._authenticatedUser.stripeConnectAccount = UserStripeConnectAccount.processItemData.fromDB(
      stripeConnectAccount
    ) as typeof stripeConnectAccount;
  }

  /* For WorkOrders and Invoices, since these pre-fetched items are being returned by a
  REST endpoint rather than GQL query, fields which are nullable in their respective GQL
  schema typedefs are NOT "auto" populated with a default value of null whenever the DB
  object does not contain the property. This causes an issue when the receiving Apollo
  client tries to write the pre-fetched items into its cache, since the returned objects
  are missing properties and therefore don't match the schema typedefs. Therefore, fields
  which are nullable/optional and aren't present in the DB object are explicitly set to
  null below to emulate GQL query-resolver behavior to ensure the client receives these
  items in the shape specified in the GQL schema.  */

  req._userQueryItems = {
    ...(workOrders.length > 0 && {
      workOrders: (WorkOrder.processItemData.fromDB(workOrders) as typeof workOrders).map(
        (workOrder) => ({
          // Fields which are nullable/optional in GQL schema default to null:
          category: null,
          checklist: null,
          dueDate: null,
          entryContact: null,
          entryContactPhone: null,
          scheduledDateTime: null,
          contractorNotes: null,
          // DB object values override above defaults:
          ...workOrder,
        })
      ),
    }),
    ...(invoices.length > 0 && {
      invoices: (Invoice.processItemData.fromDB(invoices) as typeof invoices).map((invoice) => ({
        // Fields which are nullable/optional in GQL schema default to null:
        stripePaymentIntentID: null,
        workOrderID: null,
        // DB object values override above defaults:
        ...invoice,
      })),
    }),
    ...(contacts.length > 0 && {
      contacts: (Contact.processItemData.fromDB(contacts) as typeof contacts).map((contact) => {
        // Fetch some additional data from the usersCache
        const {
          email = "", // These defaults shouldn't be necessary, but are included for type-safety
          phone = "",
          profile = { displayName: contact.handle },
        } = usersCache.get(contact.userID) || {};

        return {
          email,
          phone,
          profile,
          ...contact,
        };
      }),
    }),
  };

  next();
});
