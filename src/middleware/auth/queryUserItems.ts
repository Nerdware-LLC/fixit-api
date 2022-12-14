import { ddbSingleTable } from "@lib/dynamoDB";
import { catchAsyncMW } from "@utils/middlewareWrappers";
import { UserSubscription, UserStripeConnectAccount, WorkOrder, Invoice, Contact } from "@models";
import {
  logger,
  AuthError,
  type WorkOrderDbTypeToApiResponseType,
  type InvoiceDbTypeToApiResponseType
} from "@utils";
import type {
  UserType,
  UserSubscriptionType,
  UserStripeConnectAccountType,
  ContactType
} from "@models";

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
export const queryUserItems = catchAsyncMW(async (req, res, next) => {
  if (!req?._user) next("User not found");

  // Cast type to UserType, TS not recognizing that "req._user" can't be undefined after above if-clause.
  req._user = req._user as UserType;

  // We want the raw attributes from the DB to compare "SK" values, so we don't use a Model-instance here.
  const items = (await ddbSingleTable.ddbClient.query({
    // In utf8 byte order, tilde comes after numbers, upper+lowercase letters, #, and $.
    KeyConditionExpression: "pk = :userID AND sk BETWEEN :userSK AND :tilde",
    ExpressionAttributeValues: {
      ":userID": req._user.id,
      ":userSK": `#DATA#${req._user.id}`,
      ":tilde": "~"
    }
  })) as Array<RawItemFromDB> | undefined;

  // If no items were found, the user doesn't exist, throw AuthError (see above jsdoc for details on this edge case)
  if (!Array.isArray(items) || items.length === 0) throw new AuthError("User does not exist");

  // Organize and format the items
  const { user, subscription, stripeConnectAccount, workOrders, invoices, contacts } = items.reduce(
    (accum, current) => {
      // Grab the "sk" value, which can be used to identify the item type
      const { sk } = current;

      switch (true) {
        case sk.startsWith("SUBSCRIPTION#"):
          accum.subscription = current;
          break;
        case sk.startsWith("STRIPE_CONNECT_ACCOUNT#"):
          accum.stripeConnectAccount = current;
          break;
        case sk.startsWith("WO#"):
          accum.workOrders.push(current);
          break;
        case sk.startsWith("INV#"):
          accum.invoices.push(current);
          break;
        case sk.startsWith("CONTACT#"):
          accum.contacts.push(current);
          break;
        case sk.startsWith("#DATA"):
          accum.user = current;
          break;
        default:
          // prettier-ignore
          logger.warn(`[queryUserItems] The following ITEM was returned by the "queryUserItems" DDB query, but items of this type are not handled by the reducer. ${JSON.stringify(current, null, 2)}`);
          break;
      }

      return accum;
    },
    {
      user: null,
      subscription: null,
      stripeConnectAccount: null,
      workOrders: [],
      invoices: [],
      contacts: []
    } as {
      user: RawItemFromDB | null;
      subscription: RawItemFromDB | null;
      stripeConnectAccount: RawItemFromDB | null;
      workOrders: Array<RawItemFromDB>;
      invoices: Array<RawItemFromDB>;
      contacts: Array<RawItemFromDB>;
    }
  );

  // If user was not found, throw AuthError (see above jsdoc for details on this edge case)
  if (!user) throw new AuthError("User does not exist");

  if (!!subscription) {
    req._user.subscription = UserSubscription.processItemData.fromDB(
      subscription
    ) as unknown as UserSubscriptionType;
    // TODO [queryUserItems MW] UserSubscription.processItemData.fromDB not providing desired type inference, currently casting to "unknown" first as a workaround.
  }

  if (!!stripeConnectAccount) {
    req._user.stripeConnectAccount = UserStripeConnectAccount.processItemData.fromDB(
      stripeConnectAccount
    ) as UserStripeConnectAccountType;
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
      workOrders: (
        WorkOrder.processItemData.fromDB(workOrders) as Array<WorkOrderDbTypeToApiResponseType>
      ).map((workOrder) => ({
        // Fields which are nullable/optional in GQL schema default to null:
        category: null,
        checklist: null,
        dueDate: null,
        entryContact: null,
        entryContactPhone: null,
        scheduledDateTime: null,
        contractorNotes: null,
        // DB object values override above defaults:
        ...workOrder
      })) as Array<WorkOrderDbTypeToApiResponseType>
    }),
    ...(invoices.length > 0 && {
      invoices: (
        Invoice.processItemData.fromDB(invoices) as Array<InvoiceDbTypeToApiResponseType>
      ).map((invoice) => ({
        // Fields which are nullable/optional in GQL schema default to null:
        stripePaymentIntentID: null,
        workOrder: null,
        // DB object values override above defaults:
        ...invoice
      })) as Array<InvoiceDbTypeToApiResponseType>
    }),
    ...(contacts.length > 0 && {
      contacts: Contact.processItemData.fromDB(contacts) as Array<ContactType>
    })
  };

  next();
});

interface RawItemFromDB {
  pk: string;
  sk: string;
  data: string;
  [keys: string]: any;
}
