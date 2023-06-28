import { Model, type ItemTypeFromSchema, type ItemInputType } from "@lib/dynamoDB";
import { USER_ID_REGEX, USER_HANDLE_REGEX } from "@models/User";
import { COMMON_ATTRIBUTES } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { CONTACT_SK_PREFIX_STR as SK_PREFIX, CONTACT_SK_REGEX } from "./regex";

/**
 * Contact DdbSingleTable Model
 */
class ContactModel extends Model<typeof ContactModel.schema> {
  static readonly SK_PREFIX = SK_PREFIX;

  static readonly getFormattedID = (contactUserID: string) => {
    return `${SK_PREFIX}#${contactUserID}`;
  };

  static readonly schema = {
    pk: {
      type: "string",
      required: true,
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value),
    },
    sk: {
      type: "string",
      alias: "id", // Contact "sk" contains the "contactUserID"
      default: (contactItem: { data: string }) => ContactModel.getFormattedID(contactItem.data),
      validate: (value: string) => CONTACT_SK_REGEX.test(value),
      required: true,
    },
    data: {
      type: "string",
      alias: "contactUserID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
    },
    handle: {
      type: "string",
      required: true,
      validate: (value: string) => USER_HANDLE_REGEX.test(value),
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const;

  constructor() {
    super("Contact", ContactModel.schema, ddbSingleTable);
  }

  // CONTACT MODEL — Instance properties and methods:
  readonly SK_PREFIX = ContactModel.SK_PREFIX;
  readonly getFormattedID = ContactModel.getFormattedID;

  // TODO This method can be rm'd
  readonly queryContactByID = async (ownUserID: string, contactUserID: string) => {
    const [contact] = await this.query({
      where: {
        userID: ownUserID,
        id: ContactModel.getFormattedID(contactUserID),
      },
      limit: 1,
      // KeyConditionExpression: "pk = :pk AND sk = :sk",
      // ExpressionAttributeValues: {
      //   ":pk": ownUserID,
      //   ":sk": `${SK_PREFIX}#${contactUserID}`,
      // },
    });
    return contact;
  };

  // TODO This method can be rm'd
  readonly queryUsersContacts = async (userID: string) => {
    return await this.query({
      where: {
        userID,
        id: { beginsWith: this.SK_PREFIX },
      },
      // KeyConditionExpression: "pk = :userID AND begins_with(sk, :contactSKprefix)",
      // ExpressionAttributeValues: {
      //   ":userID": userID,
      //   ":contactSKprefix": `${SK_PREFIX}#`,
      // },
    });
  };
}

export const Contact = new ContactModel();

export type ContactModelItem = ItemTypeFromSchema<typeof ContactModel.schema>;
export type ContactModelInput = ItemInputType<typeof ContactModel.schema>;
