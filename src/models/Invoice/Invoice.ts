import { Model } from "@lib/dynamoDB";
import { isValidStripeID } from "@lib/stripe";
import { userModelHelpers } from "@models/User/helpers";
import { workOrderModelHelpers as woModelHelpers } from "@models/WorkOrder/helpers";
import { COMMON_ATTRIBUTES, type FixitUserFields } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { INVOICE_ENUM_CONSTANTS } from "./enumConstants";
import { invoiceModelHelpers } from "./helpers";
import { INVOICE_SK_PREFIX_STR } from "./regex";
import { updateOne } from "./updateOne";
import type {
  ItemTypeFromSchema,
  ItemInputType,
  ModelSchemaOptions,
  DynamoDbItemType,
} from "@lib/dynamoDB";

/**
 * Invoice DdbSingleTable Model
 */
class InvoiceModel extends Model<typeof InvoiceModel.schema, InvoiceModelItem, InvoiceModelInput> {
  static readonly schema = ddbSingleTable.getModelSchema({
    pk: {
      type: "string",
      alias: "createdByUserID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      alias: "id",
      default: ({ pk, createdAt }: { pk: string; createdAt: Date }) =>
        invoiceModelHelpers.id.format(pk, createdAt),
      validate: invoiceModelHelpers.id.isValid,
      required: true,
    },
    data: {
      type: "string",
      alias: "assignedToUserID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    workOrderID: {
      type: "string",
      validate: woModelHelpers.id.isValid,
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
      oneOf: INVOICE_ENUM_CONSTANTS.STATUSES,
      default: "OPEN",
      required: true,
    },
    stripePaymentIntentID: {
      type: "string",
      validate: (value?: unknown) =>
        value === null ||
        value === undefined ||
        (typeof value === "string" && isValidStripeID.paymentIntent(value)),
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const);

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
    // These properties are added by transformItem, so they must be allow-listed:
    allowUnknownAttributes: ["createdBy", "assignedTo"],
  };

  constructor() {
    super("Invoice", InvoiceModel.schema, {
      ...InvoiceModel.schemaOptions,
      ...ddbSingleTable,
    });
  }

  // INVOICE MODEL — Instance properties and methods:
  readonly STATUSES = INVOICE_ENUM_CONSTANTS.STATUSES;
  readonly SK_PREFIX = INVOICE_SK_PREFIX_STR;
  readonly getFormattedID = invoiceModelHelpers.id.format;
  readonly isValidID = invoiceModelHelpers.id.isValid;
  readonly updateOne = updateOne;
}

export const Invoice = new InvoiceModel();

/** The shape of an `Invoice` object returned from Model read/write methods. */
export type InvoiceModelItem = FixitUserFields<ItemTypeFromSchema<typeof InvoiceModel.schema>>;

/** The shape of an `Invoice` input arg for Model write methods. */
export type InvoiceModelInput = ItemInputType<typeof InvoiceModel.schema>;

/**
 * The shape of an `Invoice` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedInvoiceModelItem = DynamoDbItemType<typeof InvoiceModel.schema>;
