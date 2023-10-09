import { Model } from "@nerdware/ddb-single-table";
import { isValidStripeID } from "@/lib/stripe";
import { userModelHelpers } from "@/models/User/helpers";
import { COMMON_ATTRIBUTES } from "@/models/_common";
import { ddbTable } from "@/models/ddbTable";
import { createOne } from "./createOne";
import { userStripeConnectAccountModelHelpers as scaModelHelpers } from "./helpers";
import { STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR } from "./regex";
import type { ItemTypeFromSchema } from "@nerdware/ddb-single-table";

/**
 * UserStripeConnectAccount DdbSingleTable Model
 */
class UserStripeConnectAccountModel extends Model<typeof UserStripeConnectAccountModel.schema> {
  static readonly schema = ddbTable.getModelSchema({
    pk: {
      type: "string",
      required: true,
      alias: "userID",
      validate: userModelHelpers.id.isValid,
    },
    sk: {
      type: "string",
      default: (userSCA: { pk?: string }) =>
        userSCA?.pk ? scaModelHelpers.sk.format(userSCA.pk) : undefined,
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
    super("UserStripeConnectAccount", UserStripeConnectAccountModel.schema, ddbTable);
  }

  // USER STRIPE CONNECT ACCOUNT MODEL — Instance properties and methods:
  readonly SK_PREFIX = STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR;
  readonly getFormattedSK = scaModelHelpers.sk.format;
  readonly createOne = createOne;
  readonly updateOne = updateOne;
}

export const UserStripeConnectAccount = new UserStripeConnectAccountModel();

/** The shape of a `UserStripeConnectAccount` object returned from Model methods. */
export type UserStripeConnectAccountItem = ItemTypeFromSchema<
  typeof UserStripeConnectAccountModel.schema
>;

/**
 * The shape of a `UserStripeConnectAccount` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedUserStripeConnectAccountItem = ItemTypeFromSchema<
  typeof UserStripeConnectAccountModel.schema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
