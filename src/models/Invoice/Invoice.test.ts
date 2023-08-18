import { MOCK_INVOICES } from "@tests/staticMockItems";
import { Invoice } from "./Invoice";

/**
 * NOTE: The following packages are mocked before these tests are run:
 * - `@aws-sdk/lib-dynamodb`
 * - `stripe`
 *
 * See Vitest setup file `src/__tests__/setupTests.ts`
 */

const { INV_A, INV_B, INV_C } = MOCK_INVOICES;

describe("Invoice Model", () => {
  describe("Invoice.createItem()", () => {
    test("returns a valid Invoice when called with valid args", async () => {
      for (const key in MOCK_INVOICES) {
        const { createdBy, assignedTo, ...invoice } = MOCK_INVOICES[key];
        const result = await Invoice.createItem({
          ...invoice,
          createdByUserID: createdBy.id,
          assignedToUserID: assignedTo.id,
        });
        expect(result).toEqual({
          ...MOCK_INVOICES[key],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });
  });

  describe("Invoice.query()", () => {
    test("returns desired Invoice when queried by ID", async () => {
      const [result] = await Invoice.query({
        where: {
          createdByUserID: INV_A.createdBy.id,
          id: INV_A.id,
        },
        limit: 1,
      });
      expect(result).toEqual({
        ...INV_A,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    test("returns all of a User's OWN Invoices when queried by the User's ID", async () => {
      const result = await Invoice.query({
        where: {
          createdByUserID: INV_A.createdBy.id,
          id: { beginsWith: Invoice.SK_PREFIX },
        },
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual([INV_A, INV_C]);
    });

    test("returns all of a User's RECEIVED Invoices when queried by the User's ID", async () => {
      const result = await Invoice.query({
        where: {
          assignedToUserID: INV_A.assignedTo.id,
          id: { beginsWith: Invoice.SK_PREFIX },
        },
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual([INV_A, INV_C]);
    });
  });

  describe("Invoice.updateOne()", () => {
    test("returns an updated Invoice with expected keys and values", async () => {
      const NEW_AMOUNT = 9000;
      const result = await Invoice.updateOne(INV_A, {
        amount: NEW_AMOUNT,
      });
      expect(result?.amount).toEqual(NEW_AMOUNT);
      expect(result).toEqual({
        ...INV_A,
        amount: NEW_AMOUNT,
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("Invoice.deleteItem()", () => {
    test("returns a deleted Contact's ID", async () => {
      const result = await Invoice.deleteItem({
        id: INV_B.id,
        createdByUserID: INV_B.createdBy.id,
      });
      expect(result?.id).toEqual(INV_B.id);
    });
  });
});
