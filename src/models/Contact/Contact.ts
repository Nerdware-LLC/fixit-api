import { Model, type ItemTypeFromSchema, type ItemInputType } from "@lib/dynamoDB";
import { userModelHelpers } from "@models/User/helpers";
import { COMMON_ATTRIBUTES } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { isValid } from "@utils/clientInputHandlers";
import { contactModelHelpers } from "./helpers";

/**
 * Contact DdbSingleTable Model
 */
class ContactModel extends Model<typeof ContactModel.schema> {
  static readonly schema = ddbSingleTable.getModelSchema({
    pk: {
      type: "string",
      alias: "userID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      alias: "id", // Contact "sk" contains the "contactUserID"
      default: (contact: { data: string }) => contactModelHelpers.id.format(contact.data),
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
      validate: (value: string) => isValid.handle(value),
      required: true,
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const);

  constructor() {
    super("Contact", ContactModel.schema, ddbSingleTable);
  }

  // CONTACT MODEL — Instance properties and methods:
  readonly SK_PREFIX = ContactModel.SK_PREFIX;
  readonly getFormattedID = contactModelHelpers.id.format;
  readonly isValidID = contactModelHelpers.id.isValid;
}

export const Contact = new ContactModel();

export type ContactModelItem = ItemTypeFromSchema<typeof ContactModel.schema>;
export type ContactModelInput = ItemInputType<typeof ContactModel.schema>;
