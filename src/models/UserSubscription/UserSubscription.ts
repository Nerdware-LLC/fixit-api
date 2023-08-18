import { Model } from "@lib/dynamoDB";
import { isValidStripeID } from "@lib/stripe";
import { userModelHelpers } from "@models/User/helpers";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { ENV } from "@server/env";
import { hasKey } from "@utils";
import { SUBSCRIPTION_ENUM_CONSTANTS } from "./enumConstants";
import { userSubscriptionModelHelpers as subModelHelpers } from "./helpers";
import { normalizeStripeFields } from "./normalizeStripeFields";
import { USER_SUB_SK_PREFIX_STR as SUB_SK_PREFIX } from "./regex";
import { updateOne } from "./updateOne";
import { upsertOne } from "./upsertOne";
import { validateExisting } from "./validateExisting";
import type { ItemTypeFromSchema, ItemInputType, DynamoDbItemType } from "@lib/dynamoDB";

/**
 * UserSubscription DdbSingleTable Model
 */
class UserSubscriptionModel extends Model<typeof UserSubscriptionModel.schema> {
  static readonly PRODUCT_IDS = { FIXIT_SUBSCRIPTION: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID }; // prettier-ignore
  static readonly PRICE_IDS = ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs;
  static readonly PROMO_CODES = ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.promoCodes;

  static readonly schema = ddbSingleTable.getModelSchema({
    pk: {
      type: "string",
      alias: "userID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      default: (subItem: { pk: string; createdAt: Date }) =>
        subModelHelpers.sk.format(subItem.pk, subItem.createdAt),
      validate: subModelHelpers.sk.isValid,
      required: true,
    },
    data: {
      type: "string",
      alias: "id", // Sub IDs comes from Stripe
      validate: (value: string) => isValidStripeID.subscription(value),
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
      oneOf: SUBSCRIPTION_ENUM_CONSTANTS.STATUSES,
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
  readonly SK_PREFIX = SUB_SK_PREFIX;
  readonly getFormattedSK = subModelHelpers.sk.format;
  readonly normalizeStripeFields = normalizeStripeFields;
  readonly updateOne = updateOne;
  readonly upsertOne = upsertOne;
  readonly validateExisting = validateExisting;
}

export const UserSubscription = new UserSubscriptionModel();

/** The shape of a `UserSubscription` object returned from Model read/write methods. */
export type UserSubscriptionModelItem = ItemTypeFromSchema<typeof UserSubscriptionModel.schema>;

/** The shape of a `UserSubscription` input arg for Model write methods. */
export type UserSubscriptionModelInput = ItemInputType<typeof UserSubscriptionModel.schema>;

/**
 * The shape of a `UserSubscription` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedUserSubscriptionModelItem = DynamoDbItemType<
  typeof UserSubscriptionModel.schema
>;

/** The names of UserSubscription Stripe prices: "TRIAL", "MONTHLY", "ANNUAL" */
export type UserSubscriptionPriceLabels = keyof typeof UserSubscriptionModel.PRICE_IDS;
