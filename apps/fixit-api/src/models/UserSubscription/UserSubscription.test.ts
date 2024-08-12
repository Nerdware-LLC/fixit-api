import {
  MOCK_USER_SUBS,
  UNALIASED_MOCK_USER_SUBS,
} from "@/tests/staticMockItems/userSubscriptions.js";
import { MOCK_USERS } from "@/tests/staticMockItems/users.js";
import { UserSubscription } from "./UserSubscription.js";
import { subModelHelpers } from "./helpers.js";

describe("UserSubscription Model", () => {
  describe("UserSubscription.upsertItem()", () => {
    test("returns a valid UserSubscription when called with valid arguments", async () => {
      // Arrange mock UserSubscriptions
      for (const key in MOCK_USER_SUBS) {
        // Get upsertItem inputs from mock UserSub
        const mockSub = MOCK_USER_SUBS[key as keyof typeof MOCK_USER_SUBS];

        // Ascertain the mock User associated with this mock UserSub
        const associatedMockUser =
          key === "SUB_A"
            ? MOCK_USERS.USER_A
            : key === "SUB_B"
              ? MOCK_USERS.USER_B
              : MOCK_USERS.USER_C;

        // Act on the UserSubscription Model's upsertItem method:

        const result = await UserSubscription.upsertItem({
          userID: associatedMockUser.id,
          id: mockSub.id,
          currentPeriodEnd: mockSub.currentPeriodEnd,
          productID: mockSub.productID,
          priceID: mockSub.priceID,
          status: mockSub.status,
          // all mock sub priceIDs are prefixed with "price_Test" (e.g., "price_TestANNUAL")
        });

        // Assert the results
        expect(result).toStrictEqual({
          ...mockSub,
          sk: expect.toSatisfyFn((value: string) => subModelHelpers.sk.isValid(value)),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });
  });

  describe("UserSubscription.query()", () => {
    test(`returns desired UserSubscription when queried by "userID"`, async () => {
      // Arrange mock UserSubscriptions
      for (const key in MOCK_USER_SUBS) {
        // Get the mock UserSub
        const mockSub = MOCK_USER_SUBS[key as keyof typeof MOCK_USER_SUBS];

        // Arrange spy on UserSubscription.ddbClient.query() method
        const querySpy = vi.spyOn(UserSubscription.ddbClient, "query").mockResolvedValueOnce({
          $metadata: {},
          Items: [UNALIASED_MOCK_USER_SUBS[key as keyof typeof MOCK_USER_SUBS]],
        });

        // Act on the UserSubscription Model's query method
        const result = await UserSubscription.query({
          where: {
            userID: mockSub.userID,
            sk: { beginsWith: UserSubscription.SK_PREFIX },
          },
          limit: 1,
        });

        // Assert the result
        expect(result).toHaveLength(1);
        expect(result).toStrictEqual([
          {
            ...mockSub,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);

        // Assert querySpy was called with expected arguments
        expect(querySpy).toHaveBeenCalledWith({
          TableName: UserSubscription.tableName,
          KeyConditionExpression: "#pk = :pk AND begins_with( #sk, :sk )",
          ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
          ExpressionAttributeValues: { ":pk": mockSub.userID, ":sk": UserSubscription.SK_PREFIX },
          Limit: 1,
        });
      }
    });
  });

  describe("UserSubscription.deleteItem()", () => {
    test(`returns a deleted UserSubscription when called with valid arguments`, async () => {
      // Arrange spy on UserSubscription.ddbClient.deleteItem() method
      const deleteItemSpy = vi
        .spyOn(UserSubscription.ddbClient, "deleteItem")
        .mockResolvedValueOnce({
          $metadata: {},
          Attributes: UNALIASED_MOCK_USER_SUBS.SUB_A,
        });

      // Act on the UserSubscription Model's deleteItem method
      const result = await UserSubscription.deleteItem({
        userID: MOCK_USER_SUBS.SUB_A.userID,
        sk: MOCK_USER_SUBS.SUB_A.sk,
      });

      // Assert the result
      expect(result).toStrictEqual(MOCK_USER_SUBS.SUB_A);

      // Assert deleteItemSpy was called with expected arguments
      expect(deleteItemSpy).toHaveBeenCalledWith({
        TableName: UserSubscription.tableName,
        Key: {
          pk: MOCK_USER_SUBS.SUB_A.userID,
          sk: MOCK_USER_SUBS.SUB_A.sk,
        },
        ReturnValues: "ALL_OLD",
      });
    });
  });
});
