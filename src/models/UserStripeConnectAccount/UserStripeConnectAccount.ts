import { isValidStripeID } from "@/lib/stripe/helpers.js";
import { userModelHelpers } from "@/models/User/helpers.js";
import { COMMON_ATTRIBUTES } from "@/models/_common/modelAttributes.js";
import { ddbTable } from "@/models/ddbTable.js";
import { scaModelHelpers } from "./helpers.js";
import type { ItemTypeFromSchema, ItemCreationParameters } from "@nerdware/ddb-single-table";

/**
 * UserStripeConnectAccount Model Schema
 */
const userStripeConnectAccountModelSchema = ddbTable.getModelSchema({
  pk: {
    type: "string",
    required: true,
    alias: "userID",
    validate: userModelHelpers.id.isValid,
  },
  sk: {
    type: "string",
    default: (userSCA: { pk?: string }) =>
      userSCA.pk ? scaModelHelpers.sk.format(userSCA.pk) : undefined,
    validate: scaModelHelpers.sk.isValid,
    required: true,
  },
  data: {
    type: "string",
    alias: "id",
    validate: (value: string) => isValidStripeID.connectAccount(value),
    required: true,
  },
  detailsSubmitted: {
    type: "boolean",
    required: true,
  },
  chargesEnabled: {
    type: "boolean",
    required: true,
  },
  payoutsEnabled: {
    type: "boolean",
    required: true,
  },
  ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
} as const);

/**
 * UserStripeConnectAccount Model
 */
export const UserStripeConnectAccount = ddbTable.createModel(
  "UserStripeConnectAccount",
  userStripeConnectAccountModelSchema
);

/** The shape of a `UserStripeConnectAccount` object returned from Model methods. */
export type UserStripeConnectAccountItem = ItemTypeFromSchema<
  typeof userStripeConnectAccountModelSchema
>;

/** `UserStripeConnectAccount` item params for `createItem()`. */
export type UserStripeConnectAccountCreateItemParams = ItemCreationParameters<
  typeof userStripeConnectAccountModelSchema
>;

/** The shape of a raw/unaliased `UserStripeConnectAccount` object in the DB. */
export type UnaliasedUserStripeConnectAccountItem = ItemTypeFromSchema<
  typeof userStripeConnectAccountModelSchema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
