import { ddbSingleTable, Model } from "@lib/dynamoDB";
import { USER_ID_REGEX } from "@models/User";
import { CONTACT_SK_REGEX } from "./regex";
import type { ModelSchemaType, ModelSchemaOptions } from "@lib/dynamoDB";

class ContactModel extends Model<typeof ContactModel.schema> {
  static readonly schema: ModelSchemaType = {
    pk: {
      type: "string",
      alias: "userID",
      validate: (value: string) => USER_ID_REGEX.test(value)
    },
    sk: {
      type: "string",
      validate: (value: string) => CONTACT_SK_REGEX.test(value)
    },
    data: {
      type: "string",
      alias: "contactUserID",
      validate: (value: string) => USER_ID_REGEX.test(value)
    }
  };

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
