import { Expo } from "expo-server-sdk";
import { Model } from "@lib/dynamoDB";
import { isValidStripeID } from "@lib/stripe";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { hasKey, isValid } from "@utils";
import { createOne } from "./createOne";
import { userModelHelpers } from "./helpers";
import type { ItemTypeFromSchema, ItemInputType, DynamoDbItemType } from "@lib/dynamoDB";
import type { UserLoginU } from "@models/UserLogin";
import type { OverrideProperties } from "type-fest";

/**
 * User DdbSingleTable Model
 */
class UserModel extends Model<typeof UserModel.schema, UserModelItem, UserModelInput> {
  static readonly schema = ddbSingleTable.getModelSchema({
    pk: {
      type: "string",
      alias: "id",
      default: ({ createdAt }: { createdAt: Date }) => userModelHelpers.id.format(createdAt),
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      default: (userItem: { pk: string }) => userModelHelpers.sk.format(userItem.pk),
      validate: userModelHelpers.sk.isValid,
      required: true,
    },
    data: {
      type: "string",
      alias: "email",
      validate: (value: string) => isValid.email(value),
      required: true,
    },
    handle: {
      type: "string",
      validate: (value: string) => isValid.handle(value),
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
        !!login &&
        hasKey(login, "type") &&
        (login?.type === "LOCAL"
          ? hasKey(login, "passwordHash")
          : login?.type === "GOOGLE_OAUTH"
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
    super("User", UserModel.schema, ddbSingleTable);
  }

  // USER MODEL — Instance methods:
  readonly getFormattedSK = userModelHelpers.sk.format;
  readonly createOne = createOne;
}

export const User = new UserModel();

/** The shape of a `User` object returned from Model read/write methods. */
export type UserModelItem = OverrideProperties<
  ItemTypeFromSchema<typeof UserModel.schema>,
  { login: UserLoginU }
>;

/** The shape of a `User` input arg for Model write methods. */
export type UserModelInput = OverrideProperties<
  ItemInputType<typeof UserModel.schema>,
  { login: UserLoginU }
>;

/**
 * The shape of a `User` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedUserModelItem = DynamoDbItemType<typeof UserModel.schema>;
