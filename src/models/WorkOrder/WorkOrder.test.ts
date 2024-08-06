import { Location } from "@/models/Location";
import {
  MOCK_WORK_ORDERS,
  UNALIASED_MOCK_WORK_ORDERS,
} from "@/tests/staticMockItems/workOrders.js";
import { WorkOrder } from "./WorkOrder.js";

// Arrange mock WorkOrders
const { WO_A, WO_B, WO_C } = MOCK_WORK_ORDERS;

describe("WorkOrder Model", () => {
  describe("WorkOrder.createItem()", () => {
    test("returns a valid WorkOrder when called with valid arguments (ORIGINAL", async () => {
      // Arrange mock WorkOrders
      for (const key in MOCK_WORK_ORDERS) {
        // Get createItem inputs from mock WorkOrder
        const mockWorkOrder = MOCK_WORK_ORDERS[key as keyof typeof MOCK_WORK_ORDERS];

        // Act on the WorkOrder Model's createItem method
        const result = await WorkOrder.createItem(mockWorkOrder);

        // Assert the result
        expect(result).toStrictEqual({
          ...mockWorkOrder,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });

    test(`throws an Error when called without a valid "createdByUserID"`, async () => {
      await expect(() =>
        WorkOrder.createItem({
          // missing createdByUserID
          assignedToUserID: WO_A.assignedToUserID,
          location: WO_A.location,
          status: WO_A.status,
        } as any)
      ).rejects.toThrow(`A value is required for WorkOrder property "createdByUserID"`);
      await expect(() =>
        WorkOrder.createItem({
          createdByUserID: "INVALID_VALUE", // <-- invalid createdByUserID
          assignedToUserID: WO_A.assignedToUserID,
          location: WO_A.location,
          status: WO_A.status,
        } as any)
      ).rejects.toThrow(/invalid value/i);
    });
    test(`throws an Error when called without a valid "assignedToUserID"`, async () => {
      // Note: WorkOrder.assignedToUserID CAN be missing, defaults to "UNASSIGNED" in db.
      await expect(() =>
        WorkOrder.createItem({
          createdByUserID: WO_A.createdByUserID,
          assignedToUserID: "INVALID_VALUE", // <-- invalid assignedToUserID
          location: WO_A.location,
          status: WO_A.status,
        } as any)
      ).rejects.toThrow(/invalid value/i);
    });
    test(`throws an Error when called without a valid "location"`, async () => {
      await expect(() =>
        WorkOrder.createItem({
          createdByUserID: WO_A.createdByUserID,
          assignedToUserID: WO_A.assignedToUserID,
          // missing location
          status: WO_A.status,
        } as any)
      ).rejects.toThrow(`A value is required for WorkOrder property "location"`);
      await expect(() =>
        WorkOrder.createItem({
          createdByUserID: WO_A.createdByUserID,
          assignedToUserID: WO_A.assignedToUserID,
          location: {}, // <-- invalid location
          status: WO_A.status,
        } as any)
      ).rejects.toThrow(/invalid value/i);
    });
    test(`throws an Error when called without a valid "status"`, async () => {
      await expect(() =>
        WorkOrder.createItem({
          createdByUserID: WO_A.createdByUserID,
          assignedToUserID: WO_A.assignedToUserID,
          location: WO_A.location,
          // missing status
        } as any)
      ).rejects.toThrow(`A value is required for WorkOrder property "status"`);
      await expect(() =>
        WorkOrder.createItem({
          createdByUserID: WO_A.createdByUserID,
          assignedToUserID: WO_A.assignedToUserID,
          location: WO_A.location,
          status: "INVALID_VALUE", // <-- invalid status
        } as any)
      ).rejects.toThrow(/Invalid type of value provided for WorkOrder property "status"/);
    });
  });

  describe("WorkOrder.query()", () => {
    test(`returns desired WorkOrder when queried by "id"`, async () => {
      // Arrange spy on WorkOrder.ddbClient.query() method
      const querySpy = vi.spyOn(WorkOrder.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_WORK_ORDERS.WO_A],
      });

      // Act on the WorkOrder Model's query method
      const result = await WorkOrder.query({
        where: { id: WO_A.id },
        limit: 1,
      });

      // Assert the result
      expect(result).toHaveLength(1);
      expect(result).toStrictEqual([WO_A]);

      // Assert querySpy was called with expected arguments
      expect(querySpy).toHaveBeenCalledWith({
        TableName: WorkOrder.tableName,
        IndexName: "Overloaded_SK_GSI",
        KeyConditionExpression: "#sk = :sk",
        ExpressionAttributeNames: { "#sk": "sk" },
        ExpressionAttributeValues: { ":sk": WO_A.id },
        Limit: 1,
      });
    });
    test("returns all of a User's OWN WorkOrders when queried by the User's ID", async () => {
      // Arrange spy on WorkOrder.ddbClient.query() method
      const querySpy = vi.spyOn(WorkOrder.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_WORK_ORDERS.WO_A],
      });

      // Act on the WorkOrder Model's query method
      const result = await WorkOrder.query({
        where: {
          createdByUserID: WO_A.createdByUserID,
          id: { beginsWith: WorkOrder.SK_PREFIX },
        },
      });

      // Assert the result
      expect(result).toHaveLength(1);
      expect(result).toStrictEqual([WO_A]);

      // Assert querySpy was called with expected arguments
      expect(querySpy).toHaveBeenCalledWith({
        TableName: WorkOrder.tableName,
        KeyConditionExpression: "#pk = :pk AND begins_with( #sk, :sk )",
        ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
        ExpressionAttributeValues: { ":pk": WO_A.createdByUserID, ":sk": WorkOrder.SK_PREFIX },
      });
    });
    test("returns all of a User's RECEIVED WorkOrders when queried by the User's ID", async () => {
      // Arrange spy on WorkOrder.ddbClient.query() method
      const querySpy = vi.spyOn(WorkOrder.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_WORK_ORDERS.WO_B, UNALIASED_MOCK_WORK_ORDERS.WO_C],
      });

      // Act on the WorkOrder Model's query method
      const result = await WorkOrder.query({
        where: {
          assignedToUserID: WO_B.assignedToUserID, // assigned to mock USER_A
          id: { beginsWith: WorkOrder.SK_PREFIX },
        },
      });

      // Assert the result
      expect(result).toHaveLength(2);
      expect(result).toStrictEqual([WO_B, WO_C]);

      // Assert querySpy was called with expected arguments
      expect(querySpy).toHaveBeenCalledWith({
        TableName: WorkOrder.tableName,
        IndexName: "Overloaded_Data_GSI",
        KeyConditionExpression: "#data = :data AND begins_with( #sk, :sk )",
        ExpressionAttributeNames: { "#data": "data", "#sk": "sk" },
        ExpressionAttributeValues: { ":data": WO_B.assignedToUserID, ":sk": WorkOrder.SK_PREFIX },
      });
    });
  });

  describe("WorkOrder.updateItem()", () => {
    test("returns the updated WorkOrder with expected keys and values", async () => {
      // Arrange new location
      const NEW_LOCATION = {
        country: "Canada",
        region: "Ontario",
        city: "Toronto",
        streetLine1: "65 King East",
      };
      const NEW_LOCATION_COMPOUND_STRING = Location.convertToCompoundString(NEW_LOCATION);

      // Arrange spy on WorkOrder.ddbClient.updateItem() method
      const updateItemSpy = vi.spyOn(WorkOrder.ddbClient, "updateItem").mockResolvedValueOnce({
        $metadata: {},
        Attributes: { ...UNALIASED_MOCK_WORK_ORDERS.WO_B, location: NEW_LOCATION_COMPOUND_STRING },
      });

      // Act on the WorkOrder Model's updateItem method
      const result = await WorkOrder.updateItem(
        { id: WO_B.id, createdByUserID: WO_B.createdByUserID },
        {
          update: {
            location: NEW_LOCATION,
          },
        }
      );

      // Assert the result
      expect(result).toStrictEqual({
        ...WO_B,
        location: new Location({ ...NEW_LOCATION, streetLine2: null }),
        updatedAt: expect.any(Date),
      });

      // Assert updateItemSpy was called with expected arguments
      expect(updateItemSpy).toHaveBeenCalledWith({
        TableName: WorkOrder.tableName,
        Key: {
          pk: WO_B.createdByUserID,
          sk: WO_B.id,
        },
        UpdateExpression: "SET #location = :location, #updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#location": "location", "#updatedAt": "updatedAt" },
        ExpressionAttributeValues: {
          ":location": NEW_LOCATION_COMPOUND_STRING,
          ":updatedAt": expect.any(Number),
        },
        ReturnValues: "ALL_NEW",
      });
    });
  });

  describe("WorkOrder.deleteItem()", () => {
    test("returns a deleted WorkOrder when called with valid arguments", async () => {
      // Arrange spy on Invoice.ddbClient.deleteItem() method
      const deleteItemSpy = vi.spyOn(WorkOrder.ddbClient, "deleteItem").mockResolvedValueOnce({
        $metadata: {},
        Attributes: UNALIASED_MOCK_WORK_ORDERS.WO_C,
      });

      // Act on the WorkOrder Model's deleteItem method
      const result = await WorkOrder.deleteItem({
        id: WO_C.id,
        createdByUserID: WO_C.createdByUserID,
      });

      // Assert the result
      expect(result).toStrictEqual(WO_C);

      // Assert deleteItemSpy was called with expected arguments
      expect(deleteItemSpy).toHaveBeenCalledWith({
        TableName: WorkOrder.tableName,
        Key: {
          pk: WO_C.createdByUserID,
          sk: WO_C.id,
        },
        ReturnValues: "ALL_OLD",
      });
    });
  });
});
