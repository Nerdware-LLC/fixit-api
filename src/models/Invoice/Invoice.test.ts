import { MOCK_INVOICES, UNALIASED_MOCK_INVOICES } from "@/tests/staticMockItems/invoices.js";
import { Invoice } from "./Invoice.js";

// Arrange mock Invoices
const { INV_A, INV_B, INV_C } = MOCK_INVOICES;

describe("Invoice Model", () => {
  describe("Invoice.createItem()", () => {
    test("returns a valid Invoice when called with valid arguments", async () => {
      // Arrange mock Invoices
      for (const key in MOCK_INVOICES) {
        // Get createItem inputs from mock Invoice
        const mockInvoice = MOCK_INVOICES[key as keyof typeof MOCK_INVOICES];

        // Act on the Invoice Model's createItem method
        const result = await Invoice.createItem(mockInvoice);

        // Assert the result
        expect(result).toStrictEqual({
          ...mockInvoice,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });
    test(`throws an Error when called without a valid "createdByUserID"`, async () => {
      await expect(() =>
        Invoice.createItem({
          // missing createdByUserID
          assignedToUserID: INV_A.assignedToUserID,
          amount: INV_A.amount,
        } as any)
      ).rejects.toThrow(`A value is required for Invoice property "createdByUserID"`);
      await expect(() =>
        Invoice.createItem({
          createdByUserID: "BAD_USER_ID", // <-- invalid createdByUserID
          assignedToUserID: INV_A.assignedToUserID,
          amount: INV_A.amount,
        } as any)
      ).rejects.toThrow(/invalid value/i);
    });
    test(`throws an Error when called without a valid "assignedToUserID"`, async () => {
      await expect(() =>
        Invoice.createItem({
          createdByUserID: INV_A.createdByUserID,
          // missing assignedToUserID
          amount: INV_A.amount,
        } as any)
      ).rejects.toThrow(`A value is required for Invoice property "assignedToUserID"`);
      await expect(() =>
        Invoice.createItem({
          createdByUserID: INV_A.createdByUserID,
          assignedToUserID: "BAD_USER_ID", // <-- invalid assignedToUserID
          amount: INV_A.amount,
        } as any)
      ).rejects.toThrow(/invalid value/i);
    });
    test(`throws an Error when called without a valid "amount"`, async () => {
      await expect(() =>
        Invoice.createItem({
          createdByUserID: INV_A.createdByUserID,
          assignedToUserID: INV_A.assignedToUserID,
          // missing amount
        } as any)
      ).rejects.toThrow(`A value is required for Invoice property "amount"`);
      await expect(() =>
        Invoice.createItem({
          createdByUserID: INV_A.createdByUserID,
          assignedToUserID: INV_A.assignedToUserID,
          amount: "BAD_AMOUNT", // <-- invalid amount
        } as any)
      ).rejects.toThrow(/Invalid type of value provided for Invoice property "amount"/);
    });
  });

  describe("Invoice.query()", () => {
    test(`returns desired Invoice when queried by "id"`, async () => {
      // Arrange spy on Invoice.ddbClient.query() method
      const querySpy = vi.spyOn(Invoice.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_INVOICES.INV_A],
      });

      // Act on the Invoice Model's query method
      const result = await Invoice.query({
        where: { id: INV_A.id },
        limit: 1,
      });

      // Assert the result
      expect(result).toHaveLength(1);
      expect(result).toStrictEqual([INV_A]);

      // Assert querySpy was called with expected arguments
      expect(querySpy).toHaveBeenCalledWith({
        TableName: Invoice.tableName,
        IndexName: "Overloaded_SK_GSI",
        KeyConditionExpression: "#sk = :sk",
        ExpressionAttributeNames: { "#sk": "sk" },
        ExpressionAttributeValues: { ":sk": INV_A.id },
        Limit: 1,
      });
    });
    test("returns all of a User's OWN Invoices when queried by the User's ID", async () => {
      // Arrange spy on Invoice.ddbClient.query() method
      const querySpy = vi.spyOn(Invoice.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_INVOICES.INV_A, UNALIASED_MOCK_INVOICES.INV_C],
      });

      // Act on the Invoice Model's query method
      const result = await Invoice.query({
        where: {
          createdByUserID: INV_A.createdByUserID,
          id: { beginsWith: Invoice.SK_PREFIX },
        },
      });

      // Assert the result
      expect(result).toHaveLength(2);
      expect(result).toStrictEqual([INV_A, INV_C]);

      // Assert querySpy was called with expected arguments
      expect(querySpy).toHaveBeenCalledWith({
        TableName: Invoice.tableName,
        KeyConditionExpression: "#pk = :pk AND begins_with( #sk, :sk )",
        ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
        ExpressionAttributeValues: { ":pk": INV_A.createdByUserID, ":sk": Invoice.SK_PREFIX },
      });
    });
    test("returns all of a User's RECEIVED Invoices when queried by the User's ID", async () => {
      // Arrange spy on Invoice.ddbClient.query() method
      const querySpy = vi.spyOn(Invoice.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_INVOICES.INV_A, UNALIASED_MOCK_INVOICES.INV_C],
      });

      // Act on the Invoice Model's query method
      const result = await Invoice.query({
        where: {
          assignedToUserID: INV_A.assignedToUserID, // assigned to USER_B
          id: { beginsWith: Invoice.SK_PREFIX },
        },
      });

      // Assert the result
      expect(result).toHaveLength(2);
      expect(result).toStrictEqual([INV_A, INV_C]);

      // Assert querySpy was called with expected arguments
      expect(querySpy).toHaveBeenCalledWith({
        TableName: Invoice.tableName,
        IndexName: "Overloaded_Data_GSI",
        KeyConditionExpression: "#data = :data AND begins_with( #sk, :sk )",
        ExpressionAttributeNames: { "#data": "data", "#sk": "sk" },
        ExpressionAttributeValues: { ":data": INV_A.assignedToUserID, ":sk": Invoice.SK_PREFIX },
      });
    });
  });

  describe("Invoice.updateItem()", () => {
    test("returns an updated Invoice with expected keys and values", async () => {
      // Arrange new amount
      const NEW_AMOUNT = 9999;

      // Arrange spy on Invoice.ddbClient.updateItem() method
      const updateItemSpy = vi.spyOn(Invoice.ddbClient, "updateItem").mockResolvedValueOnce({
        $metadata: {},
        Attributes: { ...UNALIASED_MOCK_INVOICES.INV_C, amount: NEW_AMOUNT },
      });

      // Act on the Invoice updateItem method
      const result = await Invoice.updateItem(
        {
          createdByUserID: INV_C.createdByUserID,
          id: INV_C.id,
        },
        {
          update: {
            amount: NEW_AMOUNT,
          },
        }
      );

      // Assert the result
      expect(result.amount).toStrictEqual(NEW_AMOUNT);
      expect(result).toStrictEqual({
        ...INV_C,
        amount: NEW_AMOUNT,
        updatedAt: expect.any(Date),
      });

      // Assert updateItemSpy was called with expected arguments
      expect(updateItemSpy).toHaveBeenCalledWith({
        TableName: Invoice.tableName,
        Key: {
          pk: INV_C.createdByUserID,
          sk: INV_C.id,
        },
        UpdateExpression: "SET #amount = :amount, #updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#amount": "amount", "#updatedAt": "updatedAt" },
        ExpressionAttributeValues: { ":amount": NEW_AMOUNT, ":updatedAt": expect.any(Number) },
        ReturnValues: "ALL_NEW",
      });
    });
  });

  describe("Invoice.deleteItem()", () => {
    test("returns a deleted Invoice when called with valid arguments", async () => {
      // Arrange spy on Invoice.ddbClient.deleteItem() method
      const deleteItemSpy = vi.spyOn(Invoice.ddbClient, "deleteItem").mockResolvedValueOnce({
        $metadata: {},
        Attributes: UNALIASED_MOCK_INVOICES.INV_B,
      });

      // Act on the Invoice Model's deleteItem method
      const result = await Invoice.deleteItem({
        id: INV_B.id,
        createdByUserID: INV_B.createdByUserID,
      });

      // Assert the result
      expect(result).toStrictEqual(INV_B);

      // Assert deleteItemSpy was called with expected arguments
      expect(deleteItemSpy).toHaveBeenCalledWith({
        TableName: Invoice.tableName,
        Key: {
          pk: INV_B.createdByUserID,
          sk: INV_B.id,
        },
        ReturnValues: "ALL_OLD",
      });
    });
  });
});
