import { Model } from "@nerdware/ddb-single-table";
import { isValidStripeID } from "@/lib/stripe";
import { userModelHelpers } from "@/models/User/helpers";
import { workOrderModelHelpers as woModelHelpers } from "@/models/WorkOrder/helpers";
import { COMMON_ATTRIBUTES } from "@/models/_common";
import { ddbTable } from "@/models/ddbTable";
import { INVOICE_ENUM_CONSTANTS } from "./enumConstants";
import { invoiceModelHelpers } from "./helpers";
import { INVOICE_SK_PREFIX_STR } from "./regex";
import type {
  ItemTypeFromSchema,
  ItemCreationParameters,
  ItemParameters,
  ModelSchemaOptions,
} from "@nerdware/ddb-single-table";

/**
 * Invoice Model
 */
class InvoiceModel extends Model<typeof InvoiceModel.schema> {
  static readonly schema = ddbTable.getModelSchema({
    pk: {
      type: "string",
      alias: "createdByUserID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      alias: "id",
      default: (invoice: { pk: string; createdAt: Date }) =>
        invoice?.pk && invoice?.createdAt
          ? invoiceModelHelpers.id.format(invoice.pk, invoice.createdAt)
          : undefined,
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
    /** This validateItem fn ensures `createdByUserID` !== `assignedToUserID` */
    validateItem: ({ pk, data }) => pk !== data,
  };

  constructor() {
    super("Invoice", InvoiceModel.schema, {
      ...InvoiceModel.schemaOptions,
      ...ddbTable,
    });
  }

  // INVOICE MODEL — Instance properties and methods:
  readonly STATUSES = INVOICE_ENUM_CONSTANTS.STATUSES;
  readonly SK_PREFIX = INVOICE_SK_PREFIX_STR;
}

export const Invoice = new InvoiceModel();

/** The shape of an `Invoice` object returned from InvoiceModel methods. */
export type InvoiceItem = ItemTypeFromSchema<typeof InvoiceModel.schema>;

/** `Invoice` item params for `createItem()`. */
export type InvoiceItemCreationParams = ItemCreationParameters<typeof InvoiceModel.schema>;

/** `Invoice` item params for `updateItem()`. */
export type InvoiceItemUpdateParams = ItemParameters<InvoiceItemCreationParams>;

/**
 * The shape of an `Invoice` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedInvoiceItem = ItemTypeFromSchema<
  typeof InvoiceModel.schema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
