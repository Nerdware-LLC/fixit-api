import { ddbSingleTable, Model } from "@lib/dynamoDB";
import { USER_ID_REGEX } from "@models/User";
import { CONTACT_SK_REGEX } from "./regex";
import type { ModelSchemaOptions } from "@lib/dynamoDB";

/**
 * Contact Model Methods:
 * @method `queryUsersContacts()`
 */
class ContactModel extends Model<typeof ContactModel.schema> {
  static readonly schema = {
    pk: {
      type: "string",
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      isHashKey: true,
      required: true
    },
    sk: {
      type: "string",
      validate: (value: string) => CONTACT_SK_REGEX.test(value),
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
      alias: "contactUserID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
      index: {
        // For relational queries using "data" as the hash key
        name: "Overloaded_Data_GSI",
        global: true,
        rangeKey: "sk",
        project: true
      }
    }
  } as const;

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      toDB: (contactItem: { contactUserID: string }) => ({
        ...contactItem,
        sk: `CONTACT#${contactItem.contactUserID}`
      })
    }
  };

  constructor() {
    super(ddbSingleTable, "Contact", ContactModel.schema, ContactModel.schemaOptions);
  }

  readonly queryUsersContacts = async (userID: string) => {
    return await this.query({
      KeyConditionExpression: "pk = :userID AND begins_with(sk, :contactSKprefix)",
      ExpressionAttributeValues: { ":userID": userID, ":contactSKprefix": "CONTACT#" }
    });
  };
}

export const Contact = new ContactModel();
