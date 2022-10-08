import { Expo } from "expo-server-sdk";
import { ddbSingleTable, Model, type ModelSchemaOptions } from "@lib/dynamoDB";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@models/_common";
import { EMAIL_REGEX } from "@utils";
import { USER_ID_REGEX, USER_SK_REGEX, USER_STRIPE_CUSTOMER_ID_REGEX } from "./regex";
import { createOne } from "./createOne";
import type { UserType } from "./types";

// TODO make sure sensitive User fields are hidden from other Users: id, stripeCustomerID, stripeConnectAccount, subscription
// TODO Make these User properties immutable: id, email, login.type, stripeCustomerID, stripeConnectAccount.id

/**
 * User Model Methods:
 * @method `createOne()`
 * @method `getUserByID()`
 * @method `batchGetUsersByID()`
 * @method `queryUserByEmail()`
 */
class UserModel extends Model<typeof UserModel.schema> {
  static readonly schema = {
    pk: {
      type: "string",
      alias: "id",
      validate: (value: string) => USER_ID_REGEX.test(value),
      isHashKey: true,
      required: true
    },
    sk: {
      type: "string",
      validate: (value: string) => USER_SK_REGEX.test(value),
      isRangeKey: true,
      required: true,
      index: {
        // For relational queryies using "sk" as the hash key
        name: "Overloaded_SK_GSI",
        global: true,
        rangeKey: "data", // TODO Double check - is any model using this GSI sk?
        project: true
      }
    },
    data: {
      type: "string",
      alias: "email",
      validate: (value: string) => EMAIL_REGEX.test(value),
      required: true,
      index: {
        // For relational queries using "data" as the hash key
        name: "Overloaded_Data_GSI",
        global: true,
        rangeKey: "sk", // WO queryWorkOrdersAssignedToUser uses this GSI SK
        project: true
      }
    },
    phone: {
      ...COMMON_ATTRIBUTE_TYPES.PHONE,
      required: true
    },
    expoPushToken: {
      type: "string",
      required: false, // Required on create, but must be nullable so PushService can rm bad tokens
      validate: (tokenValue: string) => tokenValue == null || Expo.isExpoPushToken(tokenValue)
    },
    stripeCustomerID: {
      type: "string",
      required: true,
      validate: (value: string) => USER_STRIPE_CUSTOMER_ID_REGEX.test(value)
    },
    login: {
      type: "map",
      required: true,
      schema: {
        // user.login.type --> type of login
        type: {
          type: "string",
          required: true,
          validate: (loginType: string) => ["LOCAL", "GOOGLE_OAUTH"].includes(loginType) // <-- emulates enum enforcement
        },
        // For LOCAL logins:
        passwordHash: { type: "string" },
        // For GOOGLE_OAUTH logins:
        googleID: { type: "string" },
        googleAccessToken: { type: "string" }
      },
      validate: (login: { type: "LOCAL" | "GOOGLE_OAUTH" }) =>
        login?.type === "LOCAL"
          ? Object.prototype.hasOwnProperty.call(login, "passwordHash")
          : login?.type === "GOOGLE_OAUTH"
          ? Object.prototype.hasOwnProperty.call(login, "googleID") &&
            Object.prototype.hasOwnProperty.call(login, "googleAccessToken")
          : false
    },
    profile: {
      type: "map",
      required: false,
      schema: {
        givenName: { type: "string" },
        familyName: { type: "string" },
        businessName: { type: "string" },
        photoURL: { type: "string" }
      }
    },
    // "createdAt" and "updatedAt"
    ...COMMON_ATTRIBUTES.TIMESTAMPS
  } as const;

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      toDB: (userItem) => ({
        ...userItem,
        sk: `#DATA#${userItem.pk}`
      })
    }
  };

  constructor() {
    super(ddbSingleTable, "User", UserModel.schema, UserModel.schemaOptions);
  }

  // USER MODEL — Instance methods:

  readonly createOne = createOne;

  readonly getUserByID = async (userID: string) => {
    return (await this.getItem({ id: userID, sk: `#DATA#${userID}` })) as UserType;
  };

  readonly batchGetUsersByID = async (userIDs: Array<string>) => {
    return (await this.batchGetItems(
      userIDs.map((id) => ({ id, sk: `#DATA#${id}` }))
    )) as Array<UserType>;
  };

  readonly queryUserByEmail = async (email: string) => {
    const [user] = await this.query({
      IndexName: "Overloaded_Data_GSI",
      KeyConditionExpression: "#e = :email",
      ExpressionAttributeNames: { "#e": "data" },
      ExpressionAttributeValues: { ":email": email },
      Limit: 1
    });

    return user as UserType;
  };
}

export const User = new UserModel();