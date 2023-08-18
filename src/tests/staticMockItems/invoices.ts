import { invoiceModelHelpers } from "@/models/Invoice/helpers";
import { MOCK_DATES, MOCK_DATE_v1_UUIDs as UUIDs } from "./dates";
import { MOCK_USERS } from "./users";
import { MOCK_WORK_ORDERS } from "./workOrders";
import type { InvoiceModelItem, UnaliasedInvoiceModelItem } from "@/models/Invoice";
import type { MocksCollection } from "./_types";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

export const MOCK_INVOICES: MocksCollection<"INV", InvoiceModelItem> = {
  /** [MOCK INV]  createdBy: `USER_A`, assignedTo: `USER_B`, status: `"OPEN"` */
  INV_A: {
    id: invoiceModelHelpers.id.formatWithExistingTimestampUUID(USER_A.id, UUIDs.MAY_1_2020),
    createdBy: { id: USER_A.id },
    assignedTo: { id: USER_B.id },
    amount: 11111,
    status: "OPEN",
    workOrderID: null,
    stripePaymentIntentID: null,
    createdAt: MOCK_DATES.MAY_1_2020,
    updatedAt: MOCK_DATES.MAY_1_2020,
  },
  /** [MOCK INV] createdBy: `USER_B`, assignedTo: `USER_C`, status: `"DISPUTED"` */
  INV_B: {
    id: invoiceModelHelpers.id.formatWithExistingTimestampUUID(USER_B.id, UUIDs.MAY_2_2020),
    createdBy: { id: USER_B.id },
    assignedTo: { id: USER_C.id },
    amount: 22222,
    status: "DISPUTED",
    workOrderID: null,
    stripePaymentIntentID: null,
    createdAt: MOCK_DATES.MAY_2_2020,
    updatedAt: MOCK_DATES.MAY_2_2020,
  },
  /** [MOCK INV] createdBy: `USER_A`, assignedTo: `USER_B`, status: `"CLOSED"` */
  INV_C: {
    id: invoiceModelHelpers.id.formatWithExistingTimestampUUID(USER_A.id, UUIDs.MAY_3_2020),
    createdBy: { id: USER_A.id },
    assignedTo: { id: USER_B.id },
    amount: 33333,
    status: "CLOSED",
    workOrderID: MOCK_WORK_ORDERS.WO_B.id,
    stripePaymentIntentID: "pi_TestTestTest",
    createdAt: MOCK_DATES.MAY_3_2020,
    updatedAt: MOCK_DATES.MAY_3_2020,
  },
};

/** Unaliased mock Invoices for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_MOCK_INVOICES = Object.fromEntries(
  Object.entries(MOCK_INVOICES).map(([key, { id, createdBy, assignedTo, ...invoice }]) => [
    key,
    {
      pk: createdBy.id,
      sk: id,
      data: assignedTo.id,
      ...invoice,
    },
  ])
) as MocksCollection<"INV", UnaliasedInvoiceModelItem>;
