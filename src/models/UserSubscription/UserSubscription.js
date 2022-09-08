import { Model } from "@models/_Model";
import { USER_ID_REGEX, USER_ID_REGEX_STR } from "@models/User";
import { UNIX_TIMESTAMP_REGEX_STR } from "@utils/regex";
import { UserSubscriptionEnums } from "./UserSubscriptionEnums";
import { normalizeStripeFields } from "./normalizeStripeFields";
import { validateExisting, SUBSCRIPTION_STATUSES } from "./validateExisting";

export const UserSubscription = Model.makeDynamooseModel("UserSubscription", {
  ITEM_SCHEMA: {
    pk: {
      map: "userID",
      validate: USER_ID_REGEX
    },
    sk: {
      validate: new RegExp(`^SUBSCRIPTION#${USER_ID_REGEX_STR}#${UNIX_TIMESTAMP_REGEX_STR}$`)
    },
    data: {
      map: "id",
      validate: /^sub_[a-zA-Z0-9]{14}$/ // Example from Stripe docs: "sub_IiUAdsiPC26N4e"
    },
    currentPeriodEnd: {
      ...Model.COMMON_MODEL_ATTRIBUTES.DATETIME, // TODO Make sure we're getting back a NUMBER, unix time in milliseconds (not a Date object)
      required: true
    },
    productID: {
      type: String,
      required: true,
      enum: UserSubscriptionEnums.PRODUCT_IDS
      /* Fixit currently only uses 1 productID for its subscription, but more
      products and tiers will be added in the future, hence "enum".        */
    },
    priceID: {
      type: String,
      required: true,
      enum: Object.values(UserSubscriptionEnums.PRICE_IDS)
    },
    status: {
      type: String,
      required: true,
      enum: Object.keys(SUBSCRIPTION_STATUSES)
    }
  },
  ITEM_SCHEMA_OPTS: {
    set: (userSubscriptionItem) => ({
      ...userSubscriptionItem,
      sk: `SUBSCRIPTION#${userSubscriptionItem.userID}#${userSubscriptionItem.createdAt}`
    })
  },
  MODEL_METHODS: {
    normalizeStripeFields, // <-- utility for normalizing sub objects returned from Stripe API
    validateExisting,
    queryUserSubscriptions: Model.COMMON_MODEL_METHODS.getQueryModelMethod({
      pkAttributeName: "userID",
      skClause: { beginsWith: "SUBSCRIPTION#" }
    })
  }
});
