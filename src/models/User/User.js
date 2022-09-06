import { Expo } from "expo-server-sdk";
import { Model } from "@models/_Model";
import { EMAIL_REGEX } from "@utils/regex";
import { USER_ID_REGEX, USER_ID_REGEX_STR } from "./regex";
import { createOne } from "./createOne";
import { getUserByID } from "./getUserByID";
import { batchGetUsersByID } from "./batchGetUsersByID";

// TODO make sure sensitive User fields are hidden from other Users: id, stripeCustomerID, stripeConnectAccount, subscription

/* TODO Can we make the following User properties immutable?
  - id
  - email
  - login.type
  - stripeCustomerID
  - stripeConnectAccount.id
*/

export const User = Model.makeDynamooseModel("User", {
  ITEM_SCHEMA: {
    pk: {
      map: "id",
      validate: USER_ID_REGEX
    },
    sk: {
      validate: new RegExp(`^#DATA#${USER_ID_REGEX_STR}$`)
    },
    data: {
      map: "email",
      validate: EMAIL_REGEX
    },
    phone: {
      ...Model.COMMON_MODEL_ATTRIBUTES.PHONE,
      required: true
    },
    expoPushToken: {
      type: String,
      required: false, // Required on create, but must be nullable so PushService can rm bad tokens
      validate: (tokenValue) => tokenValue == null || Expo.isExpoPushToken(tokenValue)
    },
    stripeCustomerID: {
      type: String,
      required: true,
      validate: /^cus_[a-zA-Z0-9]{14}$/ // Example from Stripe docs: "cus_IiU67YFNrznvI3"
    },
    login: {
      type: Object,
      required: true,
      schema: {
        // user.login.type --> type of login
        type: {
          type: String,
          required: true,
          enum: ["LOCAL", "GOOGLE_OAUTH"]
        },
        // For LOCAL logins:
        passwordHash: String,
        // For GOOGLE_OAUTH logins:
        googleID: String,
        googleAccessToken: String
      },
      validate: (loginValue) =>
        loginValue.type === "LOCAL"
          ? Object.prototype.hasOwnProperty.call(loginValue, "passwordHash")
          : loginValue.type === "GOOGLE_OAUTH"
          ? Object.prototype.hasOwnProperty.call(loginValue, "googleID") &&
            Object.prototype.hasOwnProperty.call(loginValue, "googleAccessToken")
          : false
    },
    profile: {
      type: Object,
      required: false,
      schema: {
        // The defaults here are for individual "profile" fields
        givenName: { type: String, default: null },
        familyName: { type: String, default: null },
        businessName: { type: String, default: null },
        photoURL: { type: String, default: null }
      },
      default: {
        // The defaults here are for if "profile" isn't provided at all
        givenName: null,
        familyName: null,
        businessName: null,
        photoURL: null
      }
    }
  },
  ITEM_SCHEMA_OPTS: {
    set: (userItem) => ({
      ...userItem,
      sk: `#DATA#${userItem.id}`
    })
  },
  MODEL_METHODS: {
    createOne,
    getUserByID,
    batchGetUsersByID,
    queryUserByEmail: Model.COMMON_MODEL_METHODS.getQueryModelMethod({
      index: "Data",
      pkAttributeName: "email",
      limit: 1
    })
  }
});
