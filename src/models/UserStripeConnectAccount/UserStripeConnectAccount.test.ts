import {
  MOCK_USER_SCAs,
  UNALIASED_MOCK_USER_SCAs,
} from "@/tests/staticMockItems/userStripeConnectAccounts.js";
import { MOCK_USERS } from "@/tests/staticMockItems/users.js";
import { UserStripeConnectAccount } from "./UserStripeConnectAccount.js";

describe("UserStripeConnectAccount Model", () => {
  describe("UserStripeConnectAccount.createOne()", () => {
    test("returns a valid UserStripeConnectAccount when called with valid args", async () => {
      // Act on the UserStripeConnectAccount Model's createOne method
      const result = await UserStripeConnectAccount.createOne({
        userID: MOCK_USER_SCAs.SCA_A.userID,
        ...MOCK_USERS.USER_A,
      });

      // Assert the result
      expect(result).toStrictEqual({
        ...MOCK_USER_SCAs.SCA_A,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

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
