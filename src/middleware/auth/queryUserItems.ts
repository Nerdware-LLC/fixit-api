import { ddbSingleTable } from "@lib/dynamoDB";
import { catchAsyncMW } from "@utils/middlewareWrappers";
import { UserSubscription, UserStripeConnectAccount, WorkOrder, Invoice, Contact } from "@models";
import type {
  UserType,
  UserSubscriptionType,
  UserStripeConnectAccountType,
  WorkOrderType,
  InvoiceType,
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
 */
export const queryUserItems = catchAsyncMW(async (req, res, next) => {
  if (!req?._user) next("User not found");

  // Cast type to UserType, TS not recognizing that "req._user" can't be undefined after above if-clause.
  req._user = req._user as UserType;

  // We want the raw attributes from the DB to compare "SK" values, so we don't use a Model-instance here.
  const items = (await ddbSingleTable.ddbClient.query({
    // In utf8 byte order, tilde comes after numbers, upper+lowercase letters, #, and $.
    KeyConditionExpression: `id = :userID AND sk BETWEEN :userSK AND ~`,
    ExpressionAttributeValues: {
      ":userID": req._user.id,
      ":userSK": `#DATA#${req._user.id}`
    }
  })) as Array<RawItemFromDB> | undefined;

  if (Array.isArray(items) && items.length > 0) {
    // Organize and format the items
    const { subscription, stripeConnectAccount, workOrders, invoices, contacts } = items.reduce(
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
          default:
            // The User Item "sk" startsWith "#DATA", and should be the only Item to use this default case.
            break;
        }

        return accum;
      },
      USER_ITEMS_REDUCER_ACCUM as typeof USER_ITEMS_REDUCER_ACCUM
    );

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

    req._userQueryItems = {
      ...(workOrders.length > 0 && {
        workOrders: WorkOrder.processItemData.fromDB(workOrders) as Array<WorkOrderType>
      }),
      ...(invoices.length > 0 && {
        invoices: Invoice.processItemData.fromDB(invoices) as Array<InvoiceType>
      }),
      ...(contacts.length > 0 && {
        contacts: Contact.processItemData.fromDB(contacts) as Array<ContactType>
      })
    };
  }

  next();
});

interface RawItemFromDB {
  pk: string;
  sk: string;
  data: string;
  [keys: string]: any;
}

const USER_ITEMS_REDUCER_ACCUM: {
  subscription: RawItemFromDB | null;
  stripeConnectAccount: RawItemFromDB | null;
  workOrders: Array<RawItemFromDB>;
  invoices: Array<RawItemFromDB>;
  contacts: Array<RawItemFromDB>;
} = {
  subscription: null,
  stripeConnectAccount: null,
  workOrders: [],
  invoices: [],
  contacts: []
};
