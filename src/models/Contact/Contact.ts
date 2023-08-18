import { Model } from "@/lib/dynamoDB";
import { userModelHelpers } from "@/models/User/helpers";
import { COMMON_ATTRIBUTES } from "@/models/_common";
import { ddbSingleTable } from "@/models/ddbSingleTable";
import { isValid } from "@/utils/clientInputHandlers";
import { contactModelHelpers } from "./helpers";
import { CONTACT_SK_PREFIX_STR } from "./regex";
import type { ItemTypeFromSchema, ItemInputType, DynamoDbItemType } from "@/lib/dynamoDB";

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
  readonly SK_PREFIX = CONTACT_SK_PREFIX_STR;
  readonly getFormattedID = contactModelHelpers.id.format;
  readonly isValidID = contactModelHelpers.id.isValid;
}

export const Contact = new ContactModel();

/** The shape of a `Contact` object returned from Model read/write methods. */
export type ContactModelItem = ItemTypeFromSchema<typeof ContactModel.schema>;

/** The shape of a `Contact` input arg for Model write methods. */
export type ContactModelInput = ItemInputType<typeof ContactModel.schema>;

/**
 * The shape of a `Contact` object in the DB.
 * > This type is used to mock `@aws-sdk/lib-dynamodb` responses.
 */
export type UnaliasedContactModelItem = DynamoDbItemType<typeof ContactModel.schema>;
