import { invoiceModelHelpers } from "@/models/Invoice/helpers.js";
import { MOCK_DATES } from "./dates.js";
import { MOCK_USERS } from "./users.js";
import { MOCK_WORK_ORDERS } from "./workOrders.js";
import type { InvoiceItem, UnaliasedInvoiceItem } from "@/models/Invoice";

const { USER_A, USER_B } = MOCK_USERS;

export const MOCK_INVOICES = {
  /** [MOCK INV]  createdBy: `USER_A`, assignedTo: `USER_B`, status: `"OPEN"` */
  INV_A: {
    id: invoiceModelHelpers.id.format(USER_A.id),
    createdByUserID: USER_A.id,
    assignedToUserID: USER_B.id,
    amount: 11111,
    status: "OPEN",
    workOrderID: null,
    stripePaymentIntentID: null,
    createdAt: MOCK_DATES.MAY_1_2020,
    updatedAt: MOCK_DATES.MAY_1_2020,
  },
  /** [MOCK INV] createdBy: `USER_B`, assignedTo: `USER_A`, status: `"DISPUTED"` */
  INV_B: {
    id: invoiceModelHelpers.id.format(USER_B.id),
    createdByUserID: USER_B.id,
    assignedToUserID: USER_A.id,
    amount: 22222,
    status: "DISPUTED",
    workOrderID: null,
    stripePaymentIntentID: null,
    createdAt: MOCK_DATES.MAY_2_2020,
    updatedAt: MOCK_DATES.MAY_2_2020,
  },
  /** [MOCK INV] createdBy: `USER_A`, assignedTo: `USER_B`, status: `"CLOSED"` */
  INV_C: {
    id: invoiceModelHelpers.id.format(USER_A.id),
    createdByUserID: USER_A.id,
    assignedToUserID: USER_B.id,
    amount: 33333,
    status: "CLOSED",
    workOrderID: MOCK_WORK_ORDERS.WO_B.id,
    stripePaymentIntentID: "pi_TestTestTest",
    createdAt: MOCK_DATES.MAY_3_2020,
    updatedAt: MOCK_DATES.MAY_3_2020,
  },
} as const satisfies Record<string, InvoiceItem>;

/** Unaliased mock Invoices for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_MOCK_INVOICES = Object.fromEntries(
  Object.entries(MOCK_INVOICES).map(
    ([key, { id, createdByUserID, assignedToUserID, ...invoice }]) => [
      key,
      {
        pk: createdByUserID,
        sk: id,
        data: assignedToUserID,
        ...invoice,
      },
    ]
  )
) as { [Key in keyof typeof MOCK_INVOICES]: UnaliasedInvoiceItem };
