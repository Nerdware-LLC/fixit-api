import { MOCK_WORK_ORDERS } from "@/tests/staticMockItems";
import { WorkOrder } from "./WorkOrder";

/**
 * NOTE: The following packages are mocked before these tests are run:
 * - `@aws-sdk/lib-dynamodb`
 * - `stripe`
 *
 * See Vitest setup file `src/tests/setupTests.ts`
 */

const { WO_A, WO_B, WO_C } = MOCK_WORK_ORDERS;

describe("WorkOrder Model", () => {
  describe("WorkOrder.createItem()", () => {
    test("returns a valid WorkOrder when called with valid args", async () => {
      for (const key in MOCK_WORK_ORDERS) {
        const { createdBy, assignedTo, ...workOrder } = MOCK_WORK_ORDERS[key];

        const result = await WorkOrder.createItem({
          createdByUserID: createdBy.id,
          ...workOrder,
          ...(assignedTo?.id && { assignedToUserID: assignedTo.id }),
        });

        expect(result).toEqual({
          ...MOCK_WORK_ORDERS[key],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });
  });

  describe("WorkOrder.query()", () => {
    test("returns desired WorkOrder when queried by ID", async () => {
      const result = await WorkOrder.query({
        where: { id: WO_A.id },
        limit: 1,
      });
      expect(result).toHaveLength(1);
      expect(result).toEqual([WO_A]);
    });
  });

  test("returns all of a User's OWN WorkOrders when queried by the User's ID", async () => {
    const result = await WorkOrder.query({
      where: {
        createdByUserID: WO_A.createdBy.id,
        id: { beginsWith: WorkOrder.SK_PREFIX },
      },
    });
    expect(result).toHaveLength(1);
    expect(result).toEqual([WO_A]);
  });

  test("returns all of a User's RECEIVED WorkOrders when queried by the User's ID", async () => {
    const result = await WorkOrder.query({
      where: {
        assignedToUserID: WO_B.assignedTo!.id,
        id: { beginsWith: WorkOrder.SK_PREFIX },
      },
    });
    expect(result).toHaveLength(2);
    expect(result).toEqual([WO_B, WO_C]);
  });

  describe("WorkOrder.updateOne()", () => {
    test("returns the updated WorkOrder with expected keys and values", async () => {
      const NEW_LOCATION = {
        country: "Canada",
        region: "Ontario",
        city: "Toronto",
        streetLine1: "65 King East",
      };
      const result = await WorkOrder.updateOne(WO_A, {
        location: NEW_LOCATION,
      });
      expect(result.location).toMatchObject(NEW_LOCATION);
      expect(result).toEqual({ ...WO_A, updatedAt: expect.any(Date) });
    });
  });

  describe("WorkOrder.deleteItem()", () => {
    test("returns a deleted WorkOrder's ID", async () => {
      for (const key in MOCK_WORK_ORDERS) {
        const result = await WorkOrder.deleteItem({
          createdByUserID: MOCK_WORK_ORDERS[key].createdBy.id,
          id: MOCK_WORK_ORDERS[key].id,
        });
        expect(result?.id).toEqual(MOCK_WORK_ORDERS[key].id);
      }
    });
  });
});
