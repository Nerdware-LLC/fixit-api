import { ddbSingleTable, Model } from "@lib/dynamoDB";
import { USER_ID_REGEX } from "@models/User";
import { STRIPE_CONNECT_ACCOUNT_SK_REGEX } from "./regex";
import { createOne } from "./createOne";
import type { ModelSchemaType, ModelSchemaOptions } from "@lib/dynamoDB";

/**
 * UserStripeConnectAccount Model Methods:
 * @method `createOne()`
 */
class UserStripeConnectAccountModel extends Model<typeof UserStripeConnectAccountModel.schema> {
  static readonly schema: ModelSchemaType = {
    pk: {
      type: "string",
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value)
    },
    sk: {
      type: "string",
      validate: (value: string) => STRIPE_CONNECT_ACCOUNT_SK_REGEX.test(value)
    },
    data: {
      type: "string",
      alias: "id",
      validate: (value: string) => /^acct_[a-zA-Z0-9]{16}$/.test(value) // Example from Stripe docs: "acct_1GpaAGC34C0mN67J"
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
    }
  };

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      toDB: (userStripeConnectAccountItem: { id: string }) => ({
        ...userStripeConnectAccountItem,
        sk: `STRIPE_CONNECT_ACCOUNT#${userStripeConnectAccountItem.id}`
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

  readonly createOne = createOne;
}

export const UserStripeConnectAccount = new UserStripeConnectAccountModel();
