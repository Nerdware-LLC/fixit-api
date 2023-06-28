import { Expo } from "expo-server-sdk";
import { Model, type ItemTypeFromSchema, type ItemInputType } from "@lib/dynamoDB";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { EMAIL_REGEX, getUnixTimestampUUID, hasKey } from "@utils";
import { createOne } from "./createOne";
import {
  USER_ID_REGEX,
  USER_SK_REGEX,
  USER_HANDLE_REGEX,
  USER_STRIPE_CUSTOMER_ID_REGEX,
} from "./regex";
import type { UserLoginU } from "@models/UserLogin";
import type { OverrideProperties } from "type-fest";

/**
 * User DdbSingleTable Model
 */
class UserModel extends Model<typeof UserModel.schema, UserModelItem, UserModelInput> {
  static readonly SK_PREFIX = `#DATA`;
  static readonly getFormattedSK = (userID: string) => `#DATA#${userID}`;

  static readonly schema = {
    pk: {
      type: "string",
      alias: "id",
      default: () => `USER#${getUnixTimestampUUID()}`,
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
    },
    sk: {
      type: "string",
      default: (userItem: { pk: string }) => UserModel.getFormattedSK(userItem.pk),
      validate: (value: string) => USER_SK_REGEX.test(value),
      required: true,
    },
    data: {
      type: "string",
      alias: "email",
      validate: (value: string) => EMAIL_REGEX.test(value),
      required: true,
    },
    handle: {
      type: "string",
      validate: (value: string) => USER_HANDLE_REGEX.test(value),
      required: true,
    },
    phone: {
      ...COMMON_ATTRIBUTE_TYPES.PHONE,
      required: true,
    },
    expoPushToken: {
      type: "string", // The push-service sets EPT to "" (empty string)
      default: "",
      validate: (tokenValue: string) => tokenValue === "" || Expo.isExpoPushToken(tokenValue),
      required: false,
    },
    stripeCustomerID: {
      type: "string",
      validate: (value: string) => USER_STRIPE_CUSTOMER_ID_REGEX.test(value),
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
        photoURL: { type: "string" },
      },
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const;

  constructor() {
    super("User", UserModel.schema, ddbSingleTable);
  }

  // USER MODEL — Instance methods:

  readonly getFormattedSK = UserModel.getFormattedSK;
  readonly createOne = createOne;

  // TODO This method can be rm'd
  readonly getUserByID = async (userID: string) => {
    return await this.getItem({ id: userID, sk: UserModel.getFormattedSK(userID) });
  };

  // TODO This method can be rm'd
  readonly batchGetUsersByID = async (userIDs: Array<string>) => {
    return await this.batchGetItems(
      userIDs.map((userID) => ({ id: userID, sk: UserModel.getFormattedSK(userID) }))
    );
  };

  // TODO This method can be rm'd
  readonly queryUserByEmail = async (email: string) => {
    const [user] = await this.query({
      where: { email },
      limit: 1,
      // IndexName: DDB_INDEXES.Overloaded_Data_GSI.name,
      // KeyConditionExpression: "#e = :email",
      // ExpressionAttributeNames: { "#e": DDB_INDEXES.Overloaded_Data_GSI.primaryKey },
      // ExpressionAttributeValues: { ":email": email },
    });
    return user;
  };
}

export const User = new UserModel();

export type UserModelItem = OverrideProperties<
  ItemTypeFromSchema<typeof UserModel.schema>,
  { login: UserLoginU }
>;
export type UserModelInput = OverrideProperties<
  ItemInputType<typeof UserModel.schema>,
  { login: UserLoginU }
>;
