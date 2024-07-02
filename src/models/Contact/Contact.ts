import { Model } from "@nerdware/ddb-single-table";
import { isValidHandle } from "@nerdware/ts-string-helpers";
import { userModelHelpers } from "@/models/User/helpers.js";
import { COMMON_ATTRIBUTES } from "@/models/_common/modelAttributes.js";
import { ddbTable } from "@/models/ddbTable.js";
import { contactModelHelpers, CONTACT_SK_PREFIX_STR } from "./helpers.js";
import type { ItemTypeFromSchema, ItemCreationParameters } from "@nerdware/ddb-single-table";

/**
 * Contact Model
 */
class ContactModel extends Model<typeof ContactModel.schema> {
  static readonly schema = ddbTable.getModelSchema({
    pk: {
      type: "string",
      alias: "userID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      alias: "id", // Contact "sk" contains the "contactUserID"
      default: (contact: { data?: string }) =>
        contact.data ? contactModelHelpers.id.format(contact.data) : undefined,
      validate: contactModelHelpers.id.isValid,
      required: true,
    },
    data: {
      type: "string",
      alias: "contactUserID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    handle: {
      type: "string",
      validate: (value: string) => isValidHandle(value),
      required: true,
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const);

  constructor() {
    super("Contact", ContactModel.schema, ddbTable);
  }

  // CONTACT MODEL — Instance properties and methods:
  readonly SK_PREFIX = CONTACT_SK_PREFIX_STR;
  readonly getFormattedID = contactModelHelpers.id.format;
  readonly isValidID = contactModelHelpers.id.isValid;
}

/** Contact Model */
export const Contact = new ContactModel();

/** The shape of a `Contact` object returned from ContactModel methods. */
export type ContactItem = ItemTypeFromSchema<typeof ContactModel.schema>;

/** `Contact` item params for `createItem()`. */
export type ContactCreateItemParams = ItemCreationParameters<typeof ContactModel.schema>;

/** The shape of a raw/unaliased `Contact` object in the DB. */
export type UnaliasedContactItem = ItemTypeFromSchema<
  typeof ContactModel.schema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
