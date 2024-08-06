import { Model } from "@nerdware/ddb-single-table";
import { isString } from "@nerdware/ts-type-safety-utils";
import { isValidStripeID } from "@/lib/stripe/helpers.js";
import { userModelHelpers } from "@/models/User/helpers.js";
import { workOrderModelHelpers as woModelHelpers } from "@/models/WorkOrder/helpers.js";
import { COMMON_ATTRIBUTES } from "@/models/_common/modelAttributes.js";
import { ddbTable } from "@/models/ddbTable.js";
import { INVOICE_ENUM_CONSTANTS } from "./enumConstants.js";
import { invoiceModelHelpers, INVOICE_SK_PREFIX_STR } from "./helpers.js";
import type {
  ItemTypeFromSchema,
  ItemCreationParameters,
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
      default: ({ pk: createdByUserID }: { pk: string }) =>
        createdByUserID ? invoiceModelHelpers.id.format(createdByUserID) : undefined,
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
      /* Invoice amount is a non-zero integer reflecting USD centage, where 100 = 100 ¢ = $1 USD.
      For i18n purposes, currency conversions will be handled through the Stripe API. */
      validate: invoiceModelHelpers.amount.isValid,
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
        (isString(value) && isValidStripeID.paymentIntent(value)),
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

  // INVOICE MODEL — Instance properties:
  readonly SK_PREFIX = INVOICE_SK_PREFIX_STR;
  readonly STATUSES = INVOICE_ENUM_CONSTANTS.STATUSES;
}

/** Invoice Model */
export const Invoice = new InvoiceModel();

/** The shape of an `Invoice` object returned from InvoiceModel methods. */
export type InvoiceItem = ItemTypeFromSchema<typeof InvoiceModel.schema>;

/** `Invoice` item params for `createItem()`. */
export type InvoiceCreateItemParams = ItemCreationParameters<typeof InvoiceModel.schema>;

/** The shape of a raw/unaliased `Invoice` object in the DB. */
export type UnaliasedInvoiceItem = ItemTypeFromSchema<
  typeof InvoiceModel.schema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
