import {
  MOCK_USER_SUBS,
  UNALIASED_MOCK_USER_SUBS,
} from "@/tests/staticMockItems/userSubscriptions";
import { MOCK_USERS } from "@/tests/staticMockItems/users";
import { UserSubscription } from "./UserSubscription";
import { userSubscriptionModelHelpers as subModelHelpers } from "./helpers";

describe("UserSubscription Model", () => {
  describe("UserSubscription.upsertOne()", () => {
    test("returns a valid UserSubscription when called with valid arguments", async () => {
      // Arrange mock UserSubscriptions
      for (const key in MOCK_USER_SUBS) {
        // Get upsertOne inputs from mock UserSub
        const mockSub = MOCK_USER_SUBS[key];

        // Ascertain the mock User associated with this mock UserSub
        const associatedMockUser =
          key === "SUB_A"
            ? MOCK_USERS.USER_A
            : key === "SUB_B"
            ? MOCK_USERS.USER_B
            : MOCK_USERS.USER_C;

        // Act on the UserSubscription Model's upsertOne method (check sub name AND priceID):

        const result_withSubName = await UserSubscription.upsertOne({
          user: associatedMockUser,
          selectedSubscription: mockSub.priceID.split("price_Test")[1] as any,
          // all mock sub priceIDs are prefixed with "price_Test" (e.g., "price_TestANNUAL")
        });
        const result_withPriceID = await UserSubscription.upsertOne({
          user: associatedMockUser,
          priceID: mockSub.priceID,
        });

        // Assert the results
        [result_withSubName, result_withPriceID].forEach((result) => {
          /* toMatchObject is used because the upsertOne method's return-value includes fields
          returned from the Stripe API that are not in the Model (e.g., "latest_invoice"). */
          expect(result).toMatchObject({
            ...mockSub,
            sk: expect.toSatisfyFn((value: string) => subModelHelpers.sk.isValid(value)),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          });
        });
      }
    });
  });

  describe("UserSubscription.query()", () => {
    test(`returns desired UserSubscription when queried by "userID"`, async () => {
      // Arrange mock UserSubscriptions
      for (const key in MOCK_USER_SUBS) {
        // Get the mock UserSub
        const mockSub = MOCK_USER_SUBS[key];

        // Arrange spy on UserSubscription.ddbClient.query() method
        const querySpy = vi.spyOn(UserSubscription.ddbClient, "query").mockResolvedValueOnce({
          $metadata: {},
          Items: [UNALIASED_MOCK_USER_SUBS[key]],
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

  describe("UserSubscription.validateExisting()", () => {
    const YEAR_2000 = new Date(2000, 0);
    const YEAR_9999 = new Date(9999, 0);

    test(`does not throw when called with a valid "active" subscription`, () => {
      expect(() => {
        UserSubscription.validateExisting({ status: "active", currentPeriodEnd: YEAR_9999 });
      }).not.toThrowError();
    });

    test(`does not throw when called with a valid "trialing" subscription`, () => {
      expect(() => {
        UserSubscription.validateExisting({ status: "trialing", currentPeriodEnd: YEAR_9999 });
      }).not.toThrowError();
    });

    test(`throws an error when called with a subscription with an invalid status`, () => {
      expect(() => {
        UserSubscription.validateExisting({ status: "past_due", currentPeriodEnd: YEAR_9999 });
      }).toThrowError("past due");
    });

    test(`throws an error when called with an expired subscription`, () => {
      expect(() => {
        UserSubscription.validateExisting({ status: "active", currentPeriodEnd: YEAR_2000 });
      }).toThrowError("expired");
    });
  });
});
