import moment from "moment";
import {
  Model,
  type ItemTypeFromSchema,
  type ItemInputType,
  type ModelSchemaOptions,
} from "@lib/dynamoDB";
import { USER_ID_REGEX } from "@models/User";
import { WORK_ORDER_ID_REGEX } from "@models/WorkOrder";
import { COMMON_ATTRIBUTES, type FixitUserFields } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { INVOICE_SK_PREFIX_STR as INV_SK_PREFIX, INVOICE_SK_REGEX as INV_SK_REGEX } from "./regex";
import { updateOne } from "./updateOne";

/**
 * Invoice DdbSingleTable Model
 */
class InvoiceModel extends Model<typeof InvoiceModel.schema, InvoiceModelItem, InvoiceModelInput> {
  static readonly STATUSES = ["OPEN", "CLOSED", "DISPUTED"] as const;
  static readonly SK_PREFIX = INV_SK_PREFIX;

  static readonly getFormattedID = (createdByUserID: string, createdAt: Date) => {
    return `${INV_SK_PREFIX}#${createdByUserID}#${moment(createdAt).unix()}`;
  };

  static readonly schema = {
    pk: {
      type: "string",
      alias: "createdByUserID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
    },
    sk: {
      type: "string",
      alias: "id",
      default: ({ pk, createdAt }: { pk: string; createdAt: Date }) => InvoiceModel.getFormattedID(pk, createdAt), // prettier-ignore
      validate: (value: string) => INV_SK_REGEX.test(value),
      required: true,
    },
    data: {
      type: "string",
      alias: "assignedToUserID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
    },
    workOrderID: {
      type: "string",
      validate: (value: string) => WORK_ORDER_ID_REGEX.test(value),
    },
    amount: {
      type: "number",
      /* Invoice amount is a non-zero integer reflecting USD centage,
      where 100 = 100 ¢ = $1 USD. For i18n purposes, currency conversions
      will be handled through the Stripe API. */
      validate: (value: number) => Number.isSafeInteger(value) && value > 0,
      required: true,
    },
    status: {
      type: "enum",
      oneOf: InvoiceModel.STATUSES,
      default: "OPEN",
      required: true,
    },
    stripePaymentIntentID: {
      type: "string",
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const;

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      /* fromDB, string fields `pk` (createdByUserID) and `data` (assignedToUserID)
      are converted into GQL-API fields `createdBy` and `assignedTo`.            */
      // IDEA Put this shared logic+type in @models/_common (share w WO)
      fromDB: ({
        pk: createdByUserID,
        data: assignedToUserID,
        ...item
      }: {
        pk: string;
        data: string;
      }) => ({
        createdBy: { id: createdByUserID },
        assignedTo: { id: assignedToUserID },
        ...item,
      }),
    },
  };

  constructor() {
    super("Invoice", InvoiceModel.schema, { ...InvoiceModel.schemaOptions, ...ddbSingleTable });
  }

  // INVOICE MODEL — Instance properties:

  readonly STATUSES = InvoiceModel.STATUSES;
  readonly SK_PREFIX = InvoiceModel.SK_PREFIX;

  // INVOICE MODEL — Instance methods:

  readonly getFormattedID = InvoiceModel.getFormattedID;
  readonly updateOne = updateOne;

  readonly queryInvoiceByID = async (invoiceID: string) => {
    const [invoice] = await this.query({
      where: { id: invoiceID },
      limit: 1,
      // IndexName: DDB_INDEXES.Overloaded_SK_GSI.name,
      // KeyConditionExpression: "id = :id",
      // ExpressionAttributeValues: { ":id": invoiceID },
    });
    return invoice;
  };

  readonly queryUsersInvoices = async (userID: string) => {
    return await this.query({
      where: {
        createdByUserID: userID,
        id: { beginsWith: this.SK_PREFIX },
      },
      // KeyConditionExpression: "pk = :userID AND begins_with(sk, :invSKprefix)",
      // ExpressionAttributeValues: {
      //   ":userID": userID,
      //   ":invSKprefix": `${INV_SK_PREFIX}#`,
      // },
    });
  };

  readonly queryInvoicesAssignedToUser = async (userID: string) => {
    return await this.query({
      where: {
        assignedToUserID: userID,
        id: { beginsWith: this.SK_PREFIX },
      },
      // IndexName: DDB_INDEXES.Overloaded_Data_GSI.name,
      // KeyConditionExpression: "#uid = :userID AND begins_with(sk, :invSKprefix)",
      // ExpressionAttributeNames: {
      //   "#uid": DDB_INDEXES.Overloaded_Data_GSI.primaryKey,
      // },
      // ExpressionAttributeValues: {
      //   ":userID": userID,
      //   ":invSKprefix": `${INV_SK_PREFIX}#`,
      // },
    });
  };
}

export const Invoice = new InvoiceModel();

export type InvoiceModelItem = FixitUserFields<ItemTypeFromSchema<typeof InvoiceModel.schema>>;
export type InvoiceModelInput = ItemInputType<typeof InvoiceModel.schema>;
