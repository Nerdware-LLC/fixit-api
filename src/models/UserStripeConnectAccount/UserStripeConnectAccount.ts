import { Model } from "@lib/dynamoDB";
import { isValidStripeID } from "@lib/stripe";
import { userModelHelpers } from "@models/User/helpers";
import { COMMON_ATTRIBUTES } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { createOne } from "./createOne";
import { userStripeConnectAccountModelHelpers as scaModelHelpers } from "./helpers";
import { STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR } from "./regex";
import { updateOne } from "./updateOne";
import type { ItemTypeFromSchema, ItemInputType, DynamoDbItemType } from "@lib/dynamoDB";

/**
 * UserStripeConnectAccount DdbSingleTable Model
 */
class UserStripeConnectAccountModel extends Model<typeof UserStripeConnectAccountModel.schema> {
  static readonly schema = ddbSingleTable.getModelSchema({
    pk: {
      type: "string",
      required: true,
      alias: "userID",
      validate: userModelHelpers.id.isValid,
    },
    sk: {
      type: "string",
      default: (scaItem: { pk: string }) => scaModelHelpers.sk.format(scaItem.pk),
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

  constructor() {
    super("UserStripeConnectAccount", UserStripeConnectAccountModel.schema, ddbSingleTable);
  }

  // USER STRIPE CONNECT ACCOUNT MODEL — Instance properties and methods:
  readonly SK_PREFIX = STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR;
  readonly getFormattedSK = scaModelHelpers.sk.format;
  readonly createOne = createOne;
  readonly updateOne = updateOne;
}

export const UserStripeConnectAccount = new UserStripeConnectAccountModel();

/** The shape of a `UserStripeConnectAccount` object returned from Model read/write methods. */
export type UserStripeConnectAccountModelItem = ItemTypeFromSchema<
  typeof UserStripeConnectAccountModel.schema
>;

/** The shape of a `UserStripeConnectAccount` input arg for Model write methods. */
export type UserStripeConnectAccountModelInput = ItemInputType<
  typeof UserStripeConnectAccountModel.schema
>;

/**
 * The shape of a `UserStripeConnectAccount` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedUserStripeConnectAccountModelItem = DynamoDbItemType<
  typeof UserStripeConnectAccountModel.schema
>;
