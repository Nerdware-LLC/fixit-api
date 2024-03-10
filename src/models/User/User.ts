import { Model } from "@nerdware/ddb-single-table";
import { isValidEmail, isValidHandle } from "@nerdware/ts-string-helpers";
import { hasKey, isPlainObject } from "@nerdware/ts-type-safety-utils";
import { Expo } from "expo-server-sdk";
import { isValidStripeID } from "@/lib/stripe/isValidStripeID.js";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@/models/_common/modelAttributes.js";
import { ddbTable } from "@/models/ddbTable.js";
import { createOne } from "./createOne.js";
import { userModelHelpers } from "./helpers.js";
import type { UserLoginU } from "@/models/UserLogin/UserLogin.js";
import type { ItemTypeFromSchema, ItemCreationParameters } from "@nerdware/ddb-single-table";
import type { OverrideProperties } from "type-fest";

/**
 * User Model
 */
class UserModel extends Model<typeof UserModel.schema, UserItem, UserItemCreationParams> {
  static readonly schema = ddbTable.getModelSchema({
    pk: {
      type: "string",
      alias: "id",
      default: ({ createdAt }: { createdAt: Date }) => userModelHelpers.id.format(createdAt),
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      default: (userItem: { pk: string }) =>
        userItem?.pk ? userModelHelpers.sk.format(userItem.pk) : undefined,
      validate: userModelHelpers.sk.isValid,
      required: true,
    },
    data: {
      type: "string",
      alias: "email",
      validate: (value: string) => isValidEmail(value),
      required: true,
    },
    handle: {
      type: "string",
      validate: (value: string) => isValidHandle(value),
      required: true, // NOTE: User.handle is case-sensitive
    },
    phone: {
      ...COMMON_ATTRIBUTE_TYPES.PHONE,
      required: true,
    },
    expoPushToken: {
      type: "string", // The push-service may set EPT to empty string
      validate: (tokenValue: string) => tokenValue === "" || Expo.isExpoPushToken(tokenValue),
      required: false,
    },
    stripeCustomerID: {
      type: "string",
      validate: (value: string) => isValidStripeID.customer(value),
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
        googleAccessToken: { type: "string" },
      },
      validate: (login: unknown) =>
        isPlainObject(login) &&
        hasKey(login, "type") &&
        (login.type === "LOCAL"
          ? hasKey(login, "passwordHash")
          : login.type === "GOOGLE_OAUTH"
            ? hasKey(login, "googleID") && hasKey(login, "googleAccessToken")
            : false),
    },
    profile: {
      type: "map",
      required: true,
      schema: {
        displayName: { type: "string", required: true },
        givenName: { type: "string" },
        familyName: { type: "string" },
        businessName: { type: "string" },
        photoUrl: { type: "string" },
      },
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const);

  constructor() {
    super("User", UserModel.schema, ddbTable);
  }

  // USER MODEL — Instance methods:
  readonly getFormattedSK = userModelHelpers.sk.format;
  readonly createOne = createOne;
}

export const User = new UserModel();

/** The shape of a `User` object returned from UserModel methods. */
export type UserItem = OverrideProperties<
  ItemTypeFromSchema<typeof UserModel.schema>,
  { login: UserLoginU }
>;

/** `User` item params for `createItem()`. */
export type UserItemCreationParams = OverrideProperties<
  ItemCreationParameters<typeof UserModel.schema>,
  { login: UserLoginU }
>;

/**
 * The shape of a `User` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedUserItem = ItemTypeFromSchema<
  typeof UserModel.schema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
