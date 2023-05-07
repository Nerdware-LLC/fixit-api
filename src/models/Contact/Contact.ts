import { ddbSingleTable, Model, type ModelSchemaOptions } from "@lib/dynamoDB";
import { USER_ID_REGEX } from "@models/User";
import { COMMON_ATTRIBUTES } from "@models/_common";
import { createOne } from "./createOne";
import { CONTACT_SK_REGEX } from "./regex";
import type { ContactType } from "@types";

/**
 * Contact Model Methods:
 * @method `createOne()`
 * @method `queryContactByID()`
 * @method `queryUsersContacts()`
 */
class ContactModel extends Model<typeof ContactModel.schema> {
  static readonly schema = {
    pk: {
      type: "string",
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      isHashKey: true,
      required: true,
    },
    sk: {
      type: "string",
      // Contact "sk" contains the "contactUserID"
      validate: (value: string) => CONTACT_SK_REGEX.test(value),
      isRangeKey: true,
      required: true,
      index: {
        // For relational queryies using "sk" as the hash key
        name: "Overloaded_SK_GSI",
        global: true,
        rangeKey: "data",
        project: true,
      },
    },
    data: {
      type: "string",
      alias: "contactUserID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
      index: {
        // For relational queries using "data" as the hash key
        name: "Overloaded_Data_GSI",
        global: true,
        rangeKey: "sk",
        project: true,
      },
    },
    // "createdAt" and "updatedAt"
    ...COMMON_ATTRIBUTES.TIMESTAMPS,
  } as const;

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      toDB: (contactItem) => ({
        ...contactItem,
        sk: `CONTACT#${contactItem.data}`,
      }),
    },
  };

  constructor() {
    super(ddbSingleTable, "Contact", ContactModel.schema, ContactModel.schemaOptions);
  }

  // CONTACT MODEL — Instance methods:

  readonly createOne = createOne;

  readonly queryContactByID = async (ownUserID: string, contactUserID: string) => {
    const [contact] = await this.query({
      KeyConditionExpression: "pk = :pk AND sk = :sk",
      ExpressionAttributeValues: {
        ":pk": ownUserID,
        ":sk": `CONTACT#${contactUserID}`,
      },
      Limit: 1,
    });

    return contact as ContactType;
  };

  readonly queryUsersContacts = async (userID: string) => {
    return (await this.query({
      KeyConditionExpression: "pk = :userID AND begins_with(sk, :contactSKprefix)",
      ExpressionAttributeValues: { ":userID": userID, ":contactSKprefix": "CONTACT#" },
    })) as Array<ContactType>;
  };
}

export const Contact = new ContactModel();
