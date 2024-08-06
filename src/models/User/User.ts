import { isValidEmail, isValidHandle, isValidName } from "@nerdware/ts-string-helpers";
import { hasKey, isPlainObject } from "@nerdware/ts-type-safety-utils";
import { Expo } from "expo-server-sdk";
import { isValidStripeID } from "@/lib/stripe/helpers.js";
import { isValidDisplayName, isValidProfilePhotoUrl } from "@/models/Profile/helpers.js";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@/models/_common/modelAttributes.js";
import { ddbTable } from "@/models/ddbTable.js";
import { userModelHelpers } from "./helpers.js";
import type { UserLoginObject } from "@/models/UserLogin";
import type { ItemTypeFromSchema, ItemCreationParameters } from "@nerdware/ddb-single-table";
import type { OverrideProperties } from "type-fest";

/**
 * User Model Schema
 */
const userModelSchema = ddbTable.getModelSchema({
  pk: {
    type: "string",
    alias: "id",
    default: ({ handle }: { handle: string }) => userModelHelpers.id.format(handle),
    validate: userModelHelpers.id.isValid,
    required: true,
  },
  sk: {
    type: "string",
    default: (userItem: { pk: string }) =>
      userItem.pk ? userModelHelpers.sk.format(userItem.pk) : undefined,
    validate: userModelHelpers.sk.isValid,
    required: true,
  },
  data: {
    type: "string",
    alias: "email",
    validate: isValidEmail,
    required: true,
    transformValue: {
      toDB: (email: string) => email.toLowerCase(),
    },
  },
  handle: {
    type: "string",
    validate: isValidHandle,
    required: true, // NOTE: User.handle is case-sensitive
  },
  phone: {
    ...COMMON_ATTRIBUTE_TYPES.PHONE,
    required: false,
  },
  expoPushToken: {
    type: "string",
    validate: (tokenValue: string) => Expo.isExpoPushToken(tokenValue),
    required: false,
  },
  stripeCustomerID: {
    type: "string",
    validate: isValidStripeID.customer,
    required: true,
  },
  login: {
    type: "map",
    required: true,
    schema: {
      // login type
      type: { type: "enum", oneOf: ["LOCAL", "GOOGLE_OAUTH"], required: true },
      // LOCAL login properties:
      passwordHash: { type: "string" },
      // GOOGLE_OAUTH login properties:
      googleID: { type: "string" },
    },
    validate: (login: unknown) =>
      isPlainObject(login) &&
      hasKey(login, "type") &&
      (login.type === "LOCAL"
        ? hasKey(login, "passwordHash")
        : login.type === "GOOGLE_OAUTH"
          ? hasKey(login, "googleID")
          : false),
  },
  profile: {
    type: "map",
    required: true,
    schema: {
      displayName: { type: "string", required: true, validate: isValidDisplayName },
      givenName: { type: "string", validate: isValidName },
      familyName: { type: "string", validate: isValidName },
      businessName: { type: "string", validate: isValidName },
      photoUrl: { type: "string", validate: isValidProfilePhotoUrl },
    },
  },
  ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
} as const);

/**
 * User Model
 */
export const User = ddbTable.createModel<typeof userModelSchema, UserItem>("User", userModelSchema);

/** The shape of a `User` object returned from Model methods. */
export type UserItem = OverrideProperties<
  ItemTypeFromSchema<typeof userModelSchema>,
  { phone: string | null; login: UserLoginObject }
>;

/** `User` item params for `createItem()`. */
export type UserCreateItemParams = OverrideProperties<
  ItemCreationParameters<typeof userModelSchema>,
  { phone: string | null; login: UserLoginObject }
>;

/** The shape of a raw/unaliased `User` object in the DB. */
export type UnaliasedUserItem = ItemTypeFromSchema<
  typeof userModelSchema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
