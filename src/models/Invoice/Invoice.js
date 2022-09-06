import { Model } from "@models/_Model";
import { USER_ID_REGEX, USER_ID_REGEX_STR } from "@models/User";
import { WORK_ORDER_ID_REGEX } from "@models/WorkOrder";
import { UNIX_TIMESTAMP_REGEX_STR } from "@utils/regex";
import { createOne } from "./createOne";
import { updateOne } from "./updateOne";
import { deleteOne } from "./deleteOne";

export const Invoice = Model.makeDynamooseModel("Invoice", {
  ITEM_SCHEMA: {
    pk: {
      map: "createdByUserID",
      validate: USER_ID_REGEX
    },
    sk: {
      map: "id",
      validate: new RegExp(`^INV#${USER_ID_REGEX_STR}#${UNIX_TIMESTAMP_REGEX_STR}$`)
    },
    data: {
      map: "assignedToUserID",
      validate: USER_ID_REGEX
    },
    workOrderID: {
      type: String,
      validate: WORK_ORDER_ID_REGEX
    },
    amount: {
      type: Number
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "DISPUTED"],
      default: "OPEN"
    },
    stripePaymentIntentID: {
      type: String,
      default: null
    }
  },
  ITEM_SCHEMA_OPTS: {
    set: (invoiceItem) => ({
      ...invoiceItem,
      sk: `INV#${invoiceItem.createdByUserID}#${invoiceItem.createdAt}`
    })
  },
  MODEL_METHODS: {
    createOne,
    updateOne,
    deleteOne,
    queryInvoiceByID: Model.COMMON_MODEL_METHODS.getQueryModelMethod({
      index: "SK",
      pkAttributeName: "id",
      limit: 1
    }),
    queryUsersInvoices: Model.COMMON_MODEL_METHODS.getQueryModelMethod({
      pkAttributeName: "createdByUserID",
      skClause: { beginsWith: "INV#" }
    })
  }
});
