import { Model } from "@models/_Model";
import { createOne } from "./createOne";

/* These vars kept causing this error: `ReferenceError: Cannot access
'USER_ID_REGEX' before initialization`. Using a dynamic import solved
the problem, but it's still unclear why these would be "uninitialized"
upon being imported normally.  */
const { USER_ID_REGEX, USER_ID_REGEX_STR } = import("@models/User");

export const UserStripeConnectAccount = Model.makeDynamooseModel("UserStripeConnectAccount", {
  ITEM_SCHEMA: {
    pk: {
      map: "userID",
      validate: USER_ID_REGEX
    },
    sk: {
      validate: new RegExp(`^STRIPE_CONNECT_ACCOUNT#${USER_ID_REGEX_STR}$`)
    },
    data: {
      map: "id",
      validate: /^acct_[a-zA-Z0-9]{16}$/ // Example from Stripe docs: "acct_1GpaAGC34C0mN67J"
    },
    detailsSubmitted: {
      type: Boolean,
      required: true
    },
    chargesEnabled: {
      type: Boolean,
      required: true
    },
    payoutsEnabled: {
      type: Boolean,
      required: true
    }
  },
  ITEM_SCHEMA_OPTS: {
    set: (userStripeConnectAccountItem) => ({
      ...userStripeConnectAccountItem,
      sk: `STRIPE_CONNECT_ACCOUNT#${userStripeConnectAccountItem.userID}`
    })
  },
  MODEL_METHODS: {
    createOne
  }
});
