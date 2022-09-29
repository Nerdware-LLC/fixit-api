import { Expo } from "expo-server-sdk";
import { ddbSingleTable, Model } from "@lib/dynamoDB";
import { COMMON_MODEL_ATTRIBUTES } from "@models/_common";
import { EMAIL_REGEX, prettifyStr } from "@utils";
import { USER_ID_REGEX, USER_SK_REGEX, USER_STRIPE_CUSTOMER_ID_REGEX } from "./regex";
import { createOne } from "./createOne";
import type { ModelSchemaType, ModelSchemaOptions } from "@lib/dynamoDB";

// TODO make sure sensitive User fields are hidden from other Users: id, stripeCustomerID, stripeConnectAccount, subscription

/* TODO Make the following User properties immutable
  - id
  - email
  - login.type
  - stripeCustomerID
  - stripeConnectAccount.id
*/

/**
 * User Model Methods:
 * @method `createOne()`
 * @method `getUserByID()`
 * @method `batchGetUsersByID()`
 * @method `queryUserByEmail()`
 */
class UserModel extends Model<typeof UserModel.schema> {
  static readonly schema: ModelSchemaType = {
    pk: {
      type: "string",
      alias: "id",
      validate: (value: string) => USER_ID_REGEX.test(value)
    },
    sk: {
      type: "string",
      validate: (value: string) => USER_SK_REGEX.test(value)
    },
    data: {
      type: "string",
      alias: "email",
      validate: (value: string) => EMAIL_REGEX.test(value)
    },
    phone: {
      ...COMMON_MODEL_ATTRIBUTES.PHONE,
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
    }
  };

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      toDB: (userItem: { id: string }) => ({
        ...userItem,
        sk: `#DATA#${userItem.id}`
      }),
      fromDB: (userItem: { phone: string }) => ({
        ...userItem,
        phone: prettifyStr.phone(userItem.phone)
      })
    }
  };

  constructor() {
    super(ddbSingleTable, "User", UserModel.schema, UserModel.schemaOptions);
  }

  // USER MODEL — Instance methods:

  readonly createOne = createOne;

  readonly getUserByID = async (userID: string) => {
    return await this.getItem({ id: userID, sk: `#DATA#${userID}` });
  };

  readonly batchGetUsersByID = async (userIDs: Array<string>) => {
    return await this.batchGetItems(userIDs.map((id) => ({ id, sk: `#DATA#${id}` })));
  };

  readonly queryUserByEmail = async (email: string) => {
    return await this.query({
      IndexName: "Overloaded_Data_GSI",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
      Limit: 1
    });
  };
}

export const User = new UserModel();
