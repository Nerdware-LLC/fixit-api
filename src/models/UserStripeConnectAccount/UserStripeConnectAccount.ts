import { Model, type ItemTypeFromSchema, type ItemInputType } from "@lib/dynamoDB";
import { USER_ID_REGEX } from "@models/User/regex";
import { COMMON_ATTRIBUTES } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { createOne } from "./createOne";
import {
  STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR as SCA_SK_PREFIX,
  STRIPE_CONNECT_ACCOUNT_SK_REGEX as SCA_SK_REGEX,
  STRIPE_CONNECT_ACCOUNT_STRIPE_ID_REGEX as SCA_ID_REGEX,
} from "./regex";
import { updateOne } from "./updateOne";

/**
 * UserStripeConnectAccount DdbSingleTable Model
 */
class UserStripeConnectAccountModel extends Model<typeof UserStripeConnectAccountModel.schema> {
  static readonly SK_PREFIX = SCA_SK_PREFIX;

  static readonly schema = {
    pk: {
      type: "string",
      required: true,
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value),
    },
    sk: {
      type: "string",
      default: (scaItem: { pk: string }) => `${SCA_SK_PREFIX}#${scaItem.pk}`,
      validate: (value: string) => SCA_SK_REGEX.test(value),
      required: true,
    },
    data: {
      type: "string",
      alias: "id",
      validate: (value: string) => SCA_ID_REGEX.test(value),
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
  } as const;

  constructor() {
    super("UserStripeConnectAccount", UserStripeConnectAccountModel.schema, ddbSingleTable);
  }

  // USER STRIPE CONNECT ACCOUNT MODEL — Instance properties and methods:
  readonly SK_PREFIX = UserStripeConnectAccountModel.SK_PREFIX;
  readonly createOne = createOne;
  readonly updateOne = updateOne;
}

export const UserStripeConnectAccount = new UserStripeConnectAccountModel();

export type UserStripeConnectAccountModelItem = ItemTypeFromSchema<
  typeof UserStripeConnectAccountModel.schema
>;
export type UserStripeConnectAccountModelInput = ItemInputType<
  typeof UserStripeConnectAccountModel.schema
>;
