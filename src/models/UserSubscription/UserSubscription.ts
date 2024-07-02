import { Model } from "@nerdware/ddb-single-table";
import { hasKey } from "@nerdware/ts-type-safety-utils";
import { pricesCache } from "@/lib/cache/pricesCache.js";
import { productsCache } from "@/lib/cache/productsCache.js";
import { isValidStripeID } from "@/lib/stripe/helpers.js";
import { userModelHelpers } from "@/models/User/helpers.js";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@/models/_common/modelAttributes.js";
import { ddbTable } from "@/models/ddbTable.js";
import {
  SUBSCRIPTION_ENUMS,
  SUBSCRIPTION_PRICE_NAMES as PRICE_NAMES,
  SUBSCRIPTION_PRODUCT_NAMES as PRODUCT_NAMES,
} from "./enumConstants.js";
import { subModelHelpers, SUB_SK_PREFIX_STR } from "./helpers.js";
import type { SubscriptionPriceName } from "@/types/graphql.js";
import type { ItemTypeFromSchema, ItemCreationParameters } from "@nerdware/ddb-single-table";
import type Stripe from "stripe";

/**
 * UserSubscription Model
 */
class UserSubscriptionModel extends Model<typeof UserSubscriptionModel.schema> {
  static readonly PRODUCT_ID = productsCache.get(PRODUCT_NAMES.FIXIT_SUBSCRIPTION)!.id;
  static readonly PRICE_IDS: Record<SubscriptionPriceName, Stripe.Price["id"]> = {
    ANNUAL: pricesCache.get(PRICE_NAMES.ANNUAL)!.id,
    MONTHLY: pricesCache.get(PRICE_NAMES.MONTHLY)!.id,
    TRIAL: pricesCache.get(PRICE_NAMES.TRIAL)!.id,
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
        sub.pk && sub.createdAt ? subModelHelpers.sk.format(sub.pk, sub.createdAt) : undefined,
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
        toDB: (value: string) => (productsCache.has(value) ? productsCache.get(value)!.id : value),
      },
    },
    priceID: {
      type: "string",
      required: true,
      validate: subModelHelpers.priceID.isValid,
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
      oneOf: SUBSCRIPTION_ENUMS.STATUSES,
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
  readonly SK_PREFIX = SUB_SK_PREFIX_STR;
  readonly getFormattedSK = subModelHelpers.sk.format;
}

/** UserSubscription Model */
export const UserSubscription = new UserSubscriptionModel();

/** The shape of a `UserSubscription` object returned from Model methods. */
export type UserSubscriptionItem = ItemTypeFromSchema<typeof UserSubscriptionModel.schema>;

/** `UserSubscription` item params for `createItem()`. */
export type UserSubscriptionCreateItemParams = ItemCreationParameters<
  typeof UserSubscriptionModel.schema
>;

/** The shape of a raw/unaliased `UserSubscription` object in the DB. */
export type UnaliasedUserSubscriptionItem = ItemTypeFromSchema<
  typeof UserSubscriptionModel.schema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
