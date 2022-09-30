import { User } from "@models/User";
import { catchAsyncMW } from "@utils/middlewareWrappers";

export const queryUserItems = catchAsyncMW(async (req, res, next) => {
  /* One single, data-efficient query obtains all of the following User Items:
    - Subscription
    - StripeConnectAccount
    - Work Orders
    - Invoices
    - Contacts
  */

  const items = await User.query({
    // In utf8 byte order, tilde comes after numbers, upper+lowercase letters, #, and $.
    KeyConditionExpression: `id = :userID AND sk BETWEEN :userSK AND ~`,
    ExpressionAttributeValues: {
      ":userID": req._user.id,
      ":userSK": `#DATA#${req._user.id}`
    }
  });

  const { subscription, stripeConnectAccount, workOrders, invoices, contacts } = items.reduce(
    (accum, current) => {
      const { sk } = current;

      // TODO Do we need/want to format Item fields here?

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
    _REDUCER_INIT_OBJ
  );

  req._user = {
    ...req._user,
    subscription,
    stripeConnectAccount
  };

  req._userQueryItems = {
    workOrders,
    invoices,
    contacts
  };

  next();
});

const _REDUCER_INIT_OBJ = {
  subscription: {},
  stripeConnectAccount: {},
  workOrders: [],
  invoices: [],
  contacts: []
};
