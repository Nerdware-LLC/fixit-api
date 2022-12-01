import { ddbSingleTable, Model, type ModelSchemaOptions } from "@lib/dynamoDB";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@models/_common";
import { USER_ID_REGEX } from "@models/User";
import { ENV } from "@server/env";
import { USER_SUBSCRIPTION_SK_REGEX, USER_SUB_STRIPE_ID_REGEX } from "./regex";
import { updateOne } from "./updateOne";
import { upsertOne } from "./upsertOne";
import { SUBSCRIPTION_STATUSES } from "./validateExisting";
import { normalizeStripeFields } from "./normalizeStripeFields";
import { validateExisting } from "./validateExisting";
import type { UserSubscriptionType } from "./types";

const {
  FIXIT_SUBSCRIPTION: { productID, priceIDs, promoCodes }
} = ENV.STRIPE.BILLING;

/**
 * UserSubscription Model Methods:
 * @method `normalizeStripeFields()`
 * @method `validateExisting()`
 * @method `queryUserSubscriptions()`
 */
class UserSubscriptionModel extends Model<typeof UserSubscriptionModel.schema> {
  static readonly schema = {
    pk: {
      type: "string",
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      isHashKey: true,
      required: true
    },
    sk: {
      type: "string",
      validate: (value: string) => USER_SUBSCRIPTION_SK_REGEX.test(value),
      isRangeKey: true,
      required: true,
      index: {
        // For relational queryies using "sk" as the hash key
        name: "Overloaded_SK_GSI",
        global: true,
        rangeKey: "data",
        project: true
      }
    },
    data: {
      type: "string",
      alias: "id",
      validate: (value: string) => USER_SUB_STRIPE_ID_REGEX.test(value), // Example Stripe sub id: "sub_1M55RlC34C0mN67JGYSD4btX"
      required: true,
      index: {
        // For relational queries using "data" as the hash key
        name: "Overloaded_Data_GSI",
        global: true,
        rangeKey: "sk",
        project: true
      }
    },
    currentPeriodEnd: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME, // TODO Make sure client gets a NUMBER, unix time in milliseconds (not a Date object)
      required: true
    },
    productID: {
      type: "string",
      required: true,
      validate: (value: string) => Object.values(UserSubscriptionModel.PRODUCT_IDS).includes(value)
      /* Fixit currently only uses 1 productID for its subscription, but more products
      and tiers will be added in the future, so `validate` emulates "enum".         */
    },
    priceID: {
      type: "string",
      required: true,
      validate: (value: string) => Object.values(UserSubscriptionModel.PRICE_IDS).includes(value)
    },
    status: {
      type: "string",
      required: true,
      validate: (value: string) => Object.keys(SUBSCRIPTION_STATUSES).includes(value)
    },
    // "createdAt" and "updatedAt"
    ...COMMON_ATTRIBUTES.TIMESTAMPS
  } as const;

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      toDB: (userSubItem) => ({
        ...userSubItem,
        // prettier-ignore
        sk: `SUBSCRIPTION#${userSubItem.pk}#${Math.floor(new Date(userSubItem.createdAt).getTime() / 1000)}`
      })
    }
  };

  static readonly PRODUCT_IDS = { FIXIT_SUBSCRIPTION: productID };
  static readonly PRICE_IDS = priceIDs;
  static readonly PROMO_CODES = promoCodes;

  constructor() {
    // prettier-ignore
    super(ddbSingleTable, "UserSubscription", UserSubscriptionModel.schema, UserSubscriptionModel.schemaOptions);
  }

  // USER SUBSCRIPTION MODEL — Instance property getters
  // The below getters allow static enums to be read from the model instance (for convenience)

  get PRODUCT_IDS() {
    return UserSubscriptionModel.PRODUCT_IDS;
  }
  get PRICE_IDS() {
    return UserSubscriptionModel.PRICE_IDS;
  }
  get PROMO_CODES() {
    return UserSubscriptionModel.PROMO_CODES;
  }

  // USER SUBSCRIPTION MODEL — Instance methods:

  // TODO Add test for this method
  readonly updateOne = updateOne;

  readonly upsertOne = upsertOne;

  readonly normalizeStripeFields = normalizeStripeFields; // <-- utility for normalizing sub objects returned from Stripe API

  readonly validateExisting = validateExisting;

  // TODO Add test for this method
  readonly queryBySubscriptionID = async (subID: string) => {
    const [userSubscription] = await this.query({
      IndexName: "Overloaded_Data_GSI",
      KeyConditionExpression: "#subID = :subID AND begins_with(sk, :skPrefix)",
      ExpressionAttributeNames: { "#subID": "data" },
      ExpressionAttributeValues: { ":subID": subID, ":skPrefix": "SUBSCRIPTION#" },
      Limit: 1
    });

    return userSubscription as Required<UserSubscriptionType>;
  };

  readonly queryUserSubscriptions = async (userID: string) => {
    return (await this.query({
      KeyConditionExpression: "pk = :userID AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: { ":userID": userID, ":skPrefix": "SUBSCRIPTION#" }
    })) as Array<UserSubscriptionType>;
  };
}

export const UserSubscription = new UserSubscriptionModel();
