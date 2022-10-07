import moment from "moment";
import { ddbSingleTable, Model, type ModelSchemaOptions } from "@lib/dynamoDB";
import { COMMON_ATTRIBUTES } from "@models/_common";
import { USER_ID_REGEX } from "@models/User";
import { WORK_ORDER_ID_REGEX } from "@models/WorkOrder";
import { INVOICE_SK_REGEX } from "./regex";
import { createOne } from "./createOne";
import { updateOne } from "./updateOne";
import { deleteOne } from "./deleteOne";
import type { InvoiceType } from "./types";

/**
 * Invoice Model Methods:
 * @method `createOne()`
 * @method `updateOne()`
 * @method `deleteOne()`
 * @method `queryInvoiceByID()`
 * @method `queryUsersInvoices()`
 */
class InvoiceModel extends Model<typeof InvoiceModel.schema> {
  static readonly schema = {
    pk: {
      type: "string",
      alias: "createdByUserID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      isHashKey: true,
      required: true
    },
    sk: {
      type: "string",
      alias: "id",
      validate: (value: string) => INVOICE_SK_REGEX.test(value),
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
      alias: "assignedToUserID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
      index: {
        // For relational queries using "data" as the hash key
        name: "Overloaded_Data_GSI",
        global: true,
        rangeKey: "sk",
        project: true
      }
    },
    workOrderID: {
      type: "string",
      validate: (value: string) => WORK_ORDER_ID_REGEX.test(value)
    },
    amount: {
      type: "number",
      /* Invoice amount is a non-zero integer reflecting USD centage,
      where 100 = 100 ¢ = $1 USD. For i18n purposes, currency conversions
      will be handled through the Stripe API.  */
      validate: (value: number) => Number.isSafeInteger(value) && value > 0
    },
    status: {
      type: "string",
      validate: (value: any) => {
        return InvoiceModel.STATUSES.includes(value);
      },
      default: "OPEN"
    },
    stripePaymentIntentID: {
      type: "string"
    },
    // "createdAt" and "updatedAt"
    ...COMMON_ATTRIBUTES.TIMESTAMPS
  } as const;

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      // prettier-ignore
      toDB: (invoiceItem) => ({
        ...invoiceItem,
        // If "sk" does not exist, but "pk" and "createdAt" do, add "sk".
        ...(!invoiceItem?.sk && !!invoiceItem?.pk && !!invoiceItem?.createdAt && {
          sk: `INV#${invoiceItem.pk}#${moment(invoiceItem.createdAt).unix()}`
        })
      })
    }
  };

  static readonly STATUSES = ["OPEN", "CLOSED", "DISPUTED"] as const;

  constructor() {
    super(ddbSingleTable, "Invoice", InvoiceModel.schema, InvoiceModel.schemaOptions);
  }

  // INVOICE MODEL — Instance property getters
  // Allow static enum to be read from the model instance for convenience

  get STATUSES() {
    return InvoiceModel.STATUSES;
  }

  // INVOICE MODEL — Instance methods:

  readonly createOne = createOne;

  readonly updateOne = updateOne;

  readonly deleteOne = deleteOne;

  readonly queryInvoiceByID = async (invoiceID: string) => {
    const [invoice] = await this.query({
      IndexName: "Overloaded_SK_GSI",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: { ":id": invoiceID },
      Limit: 1
    });

    return invoice as InvoiceType;
  };

  readonly queryUsersInvoices = async (userID: string) => {
    return (await this.query({
      KeyConditionExpression: "pk = :userID AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: { ":userID": userID, ":skPrefix": "INV#" }
    })) as Array<InvoiceType>;
  };

  readonly queryInvoicesAssignedToUser = async (userID: string) => {
    return (await this.query({
      IndexName: "Overloaded_Data_GSI",
      KeyConditionExpression: "#uid = :userID AND begins_with(sk, :skPrefix)",
      ExpressionAttributeNames: { "#uid": "data" },
      ExpressionAttributeValues: { ":userID": userID, ":skPrefix": "INV#" }
    })) as Array<InvoiceType>;
  };
}

export const Invoice = new InvoiceModel();
