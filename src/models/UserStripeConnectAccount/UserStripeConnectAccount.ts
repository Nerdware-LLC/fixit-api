import { ddbSingleTable, Model, type ModelSchemaOptions } from "@lib/dynamoDB";
import { COMMON_ATTRIBUTES } from "@models/_common";
import { USER_ID_REGEX } from "@models/User/regex";
import { STRIPE_CONNECT_ACCOUNT_SK_REGEX, STRIPE_CONNECT_ACCOUNT_STRIPE_ID_REGEX } from "./regex";
import { createOne } from "./createOne";
import { updateOne } from "./updateOne";

/**
 * UserStripeConnectAccount Model Methods:
 * @method `createOne()`
 * @method `updateOne()`
 * @method `queryByStripeConnectAccountID()`
 */
class UserStripeConnectAccountModel extends Model<typeof UserStripeConnectAccountModel.schema> {
  static readonly schema = {
    pk: {
      type: "string",
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      isHashKey: true,
      required: true
    },
    sk: {
      type: "string",
      validate: (value: string) => STRIPE_CONNECT_ACCOUNT_SK_REGEX.test(value),
      isRangeKey: true,
      required: true,
      index: {
        // For relational queryies using "sk" as the hash key
        name: "Overloaded_SK_GSI",
        global: true,
        rangeKey: "data",
        project: true
      }
    },
    data: {
      type: "string",
      alias: "id",
      validate: (value: string) => STRIPE_CONNECT_ACCOUNT_STRIPE_ID_REGEX.test(value), // Example from Stripe docs: "acct_1GpaAGC34C0mN67J"
      required: true,
      index: {
        // For relational queries using "data" as the hash key
        name: "Overloaded_Data_GSI",
        global: true,
        rangeKey: "sk",
        project: true
      }
    },
    detailsSubmitted: {
      type: "boolean",
      required: true
    },
    chargesEnabled: {
      type: "boolean",
      required: true
    },
    payoutsEnabled: {
      type: "boolean",
      required: true
    },
    // "createdAt" and "updatedAt"
    ...COMMON_ATTRIBUTES.TIMESTAMPS
  } as const;

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      // prettier-ignore
      toDB: (userStripeConnectAccountItem) => ({
        ...userStripeConnectAccountItem,
        ...(!userStripeConnectAccountItem.sk && !!userStripeConnectAccountItem.pk && {
          sk: `STRIPE_CONNECT_ACCOUNT#${userStripeConnectAccountItem.pk}`
        })
      })
    }
  };

  constructor() {
    super(
      ddbSingleTable,
      "UserStripeConnectAccount",
      UserStripeConnectAccountModel.schema,
      UserStripeConnectAccountModel.schemaOptions
    );
  }

  // USER STRIPE CONNECT ACCOUNT MODEL — Instance methods:

  readonly createOne = createOne;

  // TODO Add test for this method
  readonly updateOne = updateOne;

  // TODO Add test for this method
  readonly queryByStripeConnectAccountID = async (stripeConnectAccountID: string) => {
    const [userSCA] = await this.query({
      IndexName: "Overloaded_Data_GSI",
      KeyConditionExpression: "#scaID = :scaID AND begins_with(sk, :skPrefix)",
      ExpressionAttributeNames: { "#scaID": "data" },
      ExpressionAttributeValues: {
        ":scaID": stripeConnectAccountID,
        ":skPrefix": "STRIPE_CONNECT_ACCOUNT#"
      },
      Limit: 1
    });

    return userSCA;
  };
}

export const UserStripeConnectAccount = new UserStripeConnectAccountModel();
