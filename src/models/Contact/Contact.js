import { Model } from "@models/_Model";
import { USER_ID_REGEX, USER_ID_REGEX_STR } from "@models/User";

export const Contact = Model.makeDynamooseModel("Contact", {
  ITEM_SCHEMA: {
    pk: {
      map: "userID",
      validate: USER_ID_REGEX
    },
    sk: {
      validate: new RegExp(`^CONTACT#${USER_ID_REGEX_STR}$`)
    },
    data: {
      map: "contactUserID",
      validate: USER_ID_REGEX
    }
  },
  ITEM_SCHEMA_OPTS: {
    set: (contactItem) => ({
      ...contactItem,
      sk: `CONTACT#${contactItem.contactUserID}`
    })
  },
  MODEL_METHODS: {
    queryUsersContacts: Model.COMMON_MODEL_METHODS.getQueryModelMethod({
      pkAttributeName: "userID",
      skClause: { beginsWith: "CONTACT#" }
    })
  }
});
