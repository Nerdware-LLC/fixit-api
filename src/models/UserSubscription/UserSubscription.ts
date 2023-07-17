import moment from "moment";
import { Model, type ItemTypeFromSchema } from "@lib/dynamoDB";
import { USER_ID_REGEX } from "@models/User/regex";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { ENV } from "@server/env";
import { hasKey } from "@utils";
import { normalizeStripeFields } from "./normalizeStripeFields";
import {
  USER_SUBSCRIPTION_SK_PREFIX_STR as SUB_SK_PREFIX,
  USER_SUBSCRIPTION_SK_REGEX as SUB_SK_REGEX,
  USER_SUB_STRIPE_ID_REGEX as SUB_ID_REGEX,
} from "./regex";
import { updateOne } from "./updateOne";
import { upsertOne } from "./upsertOne";
import { validateExisting, SUBSCRIPTION_STATUS_METADATA } from "./validateExisting";
import type { SubscriptionStatus } from "@types";

/**
 * UserSubscription DdbSingleTable Model
 */
class UserSubscriptionModel extends Model<typeof UserSubscriptionModel.schema> {
  static readonly PRODUCT_IDS = { FIXIT_SUBSCRIPTION: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID }; // prettier-ignore
  static readonly PRICE_IDS = ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs;
  static readonly PROMO_CODES = ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.promoCodes;
  static readonly SK_PREFIX = SUB_SK_PREFIX;

  static readonly getFormattedSK = (userID: string, createdAt: Date) => {
    return `${SUB_SK_PREFIX}#${userID}#${moment(createdAt).unix()}`;
  };

  static readonly normalizeStripeFields = normalizeStripeFields;

  static readonly schema = ddbSingleTable.getModelSchema({
    pk: {
      type: "string",
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
    },
    sk: {
      type: "string",
      default: (subItem: { pk: string; createdAt: Date }) => UserSubscriptionModel.getFormattedSK(subItem.pk, subItem.createdAt), // prettier-ignore
      validate: (value: string) => SUB_SK_REGEX.test(value),
      required: true,
    },
    data: {
      type: "string",
      alias: "id", // Sub IDs comes from Stripe
      validate: (value: string) => SUB_ID_REGEX.test(value),
      required: true,
    },
    currentPeriodEnd: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME,
      required: true,
    },
    productID: {
      type: "string",
      required: true,
      validate: (value: string) => Object.values(UserSubscriptionModel.PRODUCT_IDS).includes(value),
      /* productID is not using type=enum at this time for two reasons:
        1, PRODUCT_IDS is env-dependent and not "known" until runtime, and
        2, Provided values may be either a key OR value from PRODUCT_IDS */
      transformValue: {
        // This toDB allows the value to be an actual product-id OR a key from PRODUCT_IDS
        toDB: (value: string) =>
          hasKey(UserSubscriptionModel.PRODUCT_IDS, value)
            ? (UserSubscriptionModel.PRODUCT_IDS[value] as string)
            : value,
      },
    },
    priceID: {
      type: "string",
      required: true,
      validate: (value: string) => Object.values(UserSubscriptionModel.PRICE_IDS).includes(value),
      /* priceID is not using type=enum at this time for two reasons:
        1, PRICE_IDS is env-dependent and not "known" until runtime, and
        2, Provided values may be either a key OR value from PRICE_IDS */
      transformValue: {
        // This toDB allows the value to be an actual price-id OR a key from PRICE_IDS
        toDB: (value: string) =>
          hasKey(UserSubscriptionModel.PRICE_IDS, value)
            ? (UserSubscriptionModel.PRICE_IDS[value] as string)
            : value,
      },
    },
    status: {
      type: "enum",
      oneOf: Object.keys(SUBSCRIPTION_STATUS_METADATA) as ReadonlyArray<SubscriptionStatus>,
      required: true,
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const);

  constructor() {
    super("UserSubscription", UserSubscriptionModel.schema, ddbSingleTable);
  }

  // USER SUBSCRIPTION MODEL — Instance properties and methods:

  readonly PRODUCT_IDS = UserSubscriptionModel.PRODUCT_IDS;
  readonly PRICE_IDS = UserSubscriptionModel.PRICE_IDS;
  readonly PROMO_CODES = UserSubscriptionModel.PROMO_CODES;
  readonly SK_PREFIX = UserSubscriptionModel.SK_PREFIX;
  readonly getFormattedSK = UserSubscriptionModel.getFormattedSK;
  readonly normalizeStripeFields = UserSubscriptionModel.normalizeStripeFields;
  readonly updateOne = updateOne;
  readonly upsertOne = upsertOne;
  readonly validateExisting = validateExisting;
}

export const UserSubscription = new UserSubscriptionModel();

export type UserSubscriptionModelItem = ItemTypeFromSchema<typeof UserSubscriptionModel.schema>;
export type UserSubscriptionPriceLabels = keyof typeof UserSubscriptionModel.PRICE_IDS;
