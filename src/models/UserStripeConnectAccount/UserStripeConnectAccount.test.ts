import {
  MOCK_USER_SCAs,
  UNALIASED_MOCK_USER_SCAs,
} from "@/tests/staticMockItems/userStripeConnectAccounts.js";
import { UserStripeConnectAccount } from "./UserStripeConnectAccount.js";

describe("UserStripeConnectAccount Model", () => {
  describe("UserStripeConnectAccount.createItem()", () => {
    test("returns a valid UserStripeConnectAccount when called with valid args", async () => {
      // Arrange mock UserSCA inputs
      for (const key in MOCK_USER_SCAs) {
        // Get input for UserStripeConnectAccount.createItem() method
        const input = MOCK_USER_SCAs[key as keyof typeof MOCK_USER_SCAs];

        // Act on the UserStripeConnectAccount Model's createItem method
        const result = await UserStripeConnectAccount.createItem(input);

        // Assert the result
        expect(result).toStrictEqual({
          ...input,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });
  });

  // TODO Make test for UserStripeConnectAccount.updateItem()

  describe("UserStripeConnectAccount.deleteItem()", () => {
    test(`returns a deleted UserStripeConnectAccount's "userID"`, async () => {
      // Arrange spy on UserStripeConnectAccount.ddbClient.deleteItem() method
      const deleteItemSpy = vi
        .spyOn(UserStripeConnectAccount.ddbClient, "deleteItem")
        .mockResolvedValueOnce({
          $metadata: {},
          Attributes: UNALIASED_MOCK_USER_SCAs.SCA_A,
        });

      // Act on the UserStripeConnectAccount Model's deleteItem method
      const result = await UserStripeConnectAccount.deleteItem({
        userID: MOCK_USER_SCAs.SCA_A.userID,
      });

      // Assert the result
      expect(result).toStrictEqual(MOCK_USER_SCAs.SCA_A);

      // Assert deleteItemSpy was called with expected arguments
      expect(deleteItemSpy).toHaveBeenCalledWith({
        TableName: UserStripeConnectAccount.tableName,
        Key: {
          pk: MOCK_USER_SCAs.SCA_A.userID,
          sk: MOCK_USER_SCAs.SCA_A.sk,
        },
        ReturnValues: "ALL_OLD",
      });
    });
  });
});
