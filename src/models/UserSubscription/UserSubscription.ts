import { Model } from "@nerdware/ddb-single-table";
import { hasKey } from "@nerdware/ts-type-safety-utils";
import { pricesCache } from "@/lib/cache/pricesCache";
import { productsCache } from "@/lib/cache/productsCache";
import { isValidStripeID } from "@/lib/stripe";
import { userModelHelpers } from "@/models/User/helpers";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@/models/_common";
import { ddbTable } from "@/models/ddbTable";
import { SUBSCRIPTION_ENUM_CONSTANTS } from "./enumConstants";
import { userSubscriptionModelHelpers as subModelHelpers } from "./helpers";
import { normalizeStripeFields } from "./normalizeStripeFields";
import { USER_SUB_SK_PREFIX_STR as SUB_SK_PREFIX } from "./regex";
import { upsertOne } from "./upsertOne";
import { validateSubscription, validatePriceID, validatePromoCode } from "./validators";
import type { OpenApiSchemas } from "@/types/open-api";
import type { ItemTypeFromSchema, ItemCreationParameters } from "@nerdware/ddb-single-table";
import type Stripe from "stripe";

/**
 * UserSubscription Model
 */
class UserSubscriptionModel extends Model<typeof UserSubscriptionModel.schema> {
  static readonly PRODUCT_ID = productsCache.get("Fixit Subscription")!.id;
  static readonly PRICE_IDS: Record<SubscriptionPriceLabels, Stripe.Price["id"]> = {
    ANNUAL: pricesCache.get("ANNUAL")!.id,
    MONTHLY: pricesCache.get("MONTHLY")!.id,
    TRIAL: pricesCache.get("TRIAL")!.id,
  };

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
      validate: (value) => isValidStripeID.subscription(value),
      required: true,
    },
    currentPeriodEnd: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME,
      required: true,
    },
    productID: {
      type: "string",
      required: true,
      validate: (value) => value === UserSubscriptionModel.PRODUCT_ID,
      // Not using type=enum here bc Product IDs are env-dependent and not known until runtime.
      transformValue: {
        // This toDB allows the value to be a Product `id` OR `name`
        toDB: (value: string) =>
          productsCache.has(value as any) ? productsCache.get(value as any)!.id : value,
      },
    },
    priceID: {
      type: "string",
      required: true,
      validate: validatePriceID,
      // Not using type=enum here bc Price IDs are env-dependent and not known until runtime.
      transformValue: {
        // This toDB allows the value to be a Price `id` OR `name`
        toDB: (value: string) =>
          hasKey(UserSubscriptionModel.PRICE_IDS, value)
            ? UserSubscriptionModel.PRICE_IDS[value]
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
  readonly PRODUCT_ID = UserSubscriptionModel.PRODUCT_ID;
  readonly PRICE_IDS = UserSubscriptionModel.PRICE_IDS;
  readonly SK_PREFIX = SUB_SK_PREFIX;
  readonly getFormattedSK = subModelHelpers.sk.format;
  readonly normalizeStripeFields = normalizeStripeFields;
  readonly upsertOne = upsertOne;
  readonly validateExisting = validateSubscription;
  readonly validatePriceID = validatePriceID;
  readonly validatePromoCode = validatePromoCode;
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

/** The names of Fixit Subscription prices: "TRIAL", "MONTHLY", "ANNUAL" */
export type SubscriptionPriceLabels = OpenApiSchemas["SubscriptionPriceName"];
