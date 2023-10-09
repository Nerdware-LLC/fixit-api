import { Model } from "@nerdware/ddb-single-table";
import { isValidStripeID } from "@/lib/stripe";
import { userModelHelpers } from "@/models/User/helpers";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@/models/_common";
import { ddbTable } from "@/models/ddbTable";
import { ENV } from "@/server/env";
import { hasKey } from "@/utils";
import { SUBSCRIPTION_ENUM_CONSTANTS } from "./enumConstants";
import { userSubscriptionModelHelpers as subModelHelpers } from "./helpers";
import { normalizeStripeFields } from "./normalizeStripeFields";
import { USER_SUB_SK_PREFIX_STR as SUB_SK_PREFIX } from "./regex";
import { upsertOne } from "./upsertOne";
import { validateExisting } from "./validateExisting";
import type { ItemTypeFromSchema, ItemCreationParameters } from "@nerdware/ddb-single-table";

/**
 * UserSubscription Model
 */
class UserSubscriptionModel extends Model<typeof UserSubscriptionModel.schema> {
  static readonly PRODUCT_IDS = { FIXIT_SUBSCRIPTION: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID }; // prettier-ignore
  static readonly PRICE_IDS = ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs;
  static readonly PROMO_CODES = ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.promoCodes;

  static readonly schema = ddbTable.getModelSchema({
    pk: {
      type: "string",
      alias: "userID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      default: (sub: { pk?: string; createdAt?: Date }) =>
        sub?.pk && sub?.createdAt ? subModelHelpers.sk.format(sub.pk, sub.createdAt) : undefined,
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
    super("UserSubscription", UserSubscriptionModel.schema, ddbTable);
  }

  // USER SUBSCRIPTION MODEL — Instance properties and methods:
  readonly PRODUCT_IDS = UserSubscriptionModel.PRODUCT_IDS;
  readonly PRICE_IDS = UserSubscriptionModel.PRICE_IDS;
  readonly PROMO_CODES = UserSubscriptionModel.PROMO_CODES;
  readonly SK_PREFIX = SUB_SK_PREFIX;
  readonly getFormattedSK = subModelHelpers.sk.format;
  readonly normalizeStripeFields = normalizeStripeFields;
  readonly upsertOne = upsertOne;
  readonly validateExisting = validateExisting;
}

export const UserSubscription = new UserSubscriptionModel();

/** The shape of a `UserSubscription` object returned from Model methods. */
export type UserSubscriptionItem = ItemTypeFromSchema<typeof UserSubscriptionModel.schema>;

/** `UserSubscription` item params for `createItem()`. */
export type UserSubscriptionItemCreationParams = ItemCreationParameters<
  typeof UserSubscriptionModel.schema
>;

/**
 * The shape of a `UserSubscription` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedUserSubscriptionItem = ItemTypeFromSchema<
  typeof UserSubscriptionModel.schema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;

/** The names of UserSubscription Stripe prices: "TRIAL", "MONTHLY", "ANNUAL" */
export type UserSubscriptionPriceLabels = keyof typeof UserSubscriptionModel.PRICE_IDS;
