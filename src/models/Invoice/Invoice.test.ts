import moment from "moment";
import { MILLISECONDS_PER_DAY } from "@tests/datetime";
import { Invoice } from "./Invoice";
import { INVOICE_SK_REGEX } from "./regex";
import type { InvoiceType } from "./types";

const USER_1 = "USER#11111111-1111-1111-1111-inv111111111";
const USER_2 = "USER#22222222-2222-2222-2222-inv222222222";

const MOCK_INPUTS = {
  // INV_A contains the bare minimum inputs for Invoice.createOne
  INV_A: {
    createdByUserID: USER_1,
    assignedToUserID: USER_2,
    amount: 10000 // $100.00
  },
  // INV_B contains all INV properties that can be provided to Invoice.createOne
  INV_B: {
    createdByUserID: USER_2,
    assignedToUserID: USER_1,
    amount: 22222, // $222.22
    workOrderID: `WO#${USER_1}#${(Date.now() - MILLISECONDS_PER_DAY * 10) / 1000}` // WO created 10 days ago
  }
} as const;

// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<keyof typeof MOCK_INPUTS>;

const testInvoiceFields = (mockInputsKey: keyof typeof MOCK_INPUTS, mockInv: InvoiceType) => {
  const mockInvInputs = MOCK_INPUTS[mockInputsKey];

  expect(mockInv.createdByUserID).toEqual(mockInvInputs.createdByUserID);
  expect(mockInv.assignedToUserID).toEqual(mockInvInputs.assignedToUserID);
  expect(mockInv.id).toMatch(INVOICE_SK_REGEX);
  expect(mockInv.amount).toEqual(mockInvInputs.amount);

  expect(moment(mockInv.createdAt).isValid()).toEqual(true);
  expect(moment(mockInv.updatedAt).isValid()).toEqual(true);
};

describe("Invoice model R/W database operations", () => {
  let createdInvoices = {} as { -readonly [K in keyof typeof MOCK_INPUTS]: InvoiceType };

  beforeAll(async () => {
    // Write mock Invoices to Table
    for (const key of MOCK_INPUT_KEYS) {
      createdInvoices[key] = await Invoice.createOne(MOCK_INPUTS[key]);
    }
  });

  // CREATE:

  test("Invoice.createOne returns expected keys and values", () => {
    Object.entries(createdInvoices).forEach(([mockInputsKey, createdInv]) => {
      testInvoiceFields(mockInputsKey as keyof typeof MOCK_INPUTS, createdInv);
    });

    // TODO Ensure FixitEventEmitter triggered onInvoiceCreated event handlers
  });

  // QUERIES:

  test("Invoice.queryInvoiceByID returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const result = await Invoice.queryInvoiceByID(createdInvoices[key].id);
      testInvoiceFields(key, result);
    }
  });

  test("Invoice.queryUsersInvoices returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // Should be an array of 1 Invoice
      const invoices = await Invoice.queryUsersInvoices(createdInvoices[key].createdByUserID);

      invoices.forEach((inv) => {
        testInvoiceFields(key, inv);
      });
    }
  });

  test("Invoice.queryInvoicesAssignedToUser returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // Should be an array of 1 Invoice
      const invoices = await Invoice.queryInvoicesAssignedToUser(
        createdInvoices[key].assignedToUserID
      );

      invoices.forEach((inv) => {
        testInvoiceFields(key, inv);
      });
    }
  });

  // UPDATE:

  test("Invoice.updateOne returns expected keys and values", async () => {
    let updatedInvoices = { ...createdInvoices };

    const NEW_INV_VALUES: Record<keyof typeof createdInvoices, Partial<InvoiceType>> = {
      INV_A: {
        amount: 9000 // $90.00 (10% discount from original INV_A amount)
      },
      INV_B: {
        stripePaymentIntentID: "foo_PaymentIntentID" // FIXME Add Stripe Payment Intent to test PayInvoice flow
      }
    };

    // Update Inv values
    for (const key of MOCK_INPUT_KEYS) {
      updatedInvoices[key] = await Invoice.updateOne(createdInvoices[key], NEW_INV_VALUES[key]);
    }

    // Test updated values
    for (const key of MOCK_INPUT_KEYS) {
      expect(updatedInvoices[key]).toMatchObject({
        ...createdInvoices[key],
        ...NEW_INV_VALUES[key]
      });
    }

    // TODO Ensure FixitEventEmitter triggered onInvoice{Updated,Paid} event handlers
  });

  // DELETE:

  test("Invoice.deleteOne returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const invToDelete = createdInvoices[key] as InvoiceType;

      const { id: deletedInvoiceID } = await Invoice.deleteOne(invToDelete);
      // If deleteOne did not error out, the delete succeeded, check ID.
      expect(deletedInvoiceID).toEqual(invToDelete.id);
    }

    // TODO Ensure FixitEventEmitter triggered onInvoiceDeleted event handlers
  });
});

// ENSURE MOCK RESOURCE CLEANUP:

afterAll(async () => {
  /* After all tests are complete, ensure all mock Items created here have been deleted.
  Note: DDB methods are called from the ddbClient to circumvent toDB IO hook actions. */

  const remainingMockINVs = await Invoice.ddbClient.scan({
    FilterExpression: "begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: { ":skPrefix": "INV#" }
  });

  if (Array.isArray(remainingMockINVs) && remainingMockINVs.length > 0) {
    await Invoice.ddbClient.batchDeleteItems(remainingMockINVs.map(({ pk, sk }) => ({ pk, sk })));
  }
});
