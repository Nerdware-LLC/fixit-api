import { MOCK_USERS, MOCK_USER_SCAs } from "@/tests/staticMockItems";
import { UserStripeConnectAccount } from "./UserStripeConnectAccount";

/**
 * NOTE: The following packages are mocked before these tests are run:
 * - `@aws-sdk/lib-dynamodb`
 * - `stripe`
 *
 * See Vitest setup file `src/tests/setupTests.ts`
 */

describe("UserStripeConnectAccount Model", () => {
  describe("UserStripeConnectAccount.createOne()", () => {
    test("returns a valid UserStripeConnectAccount when called with valid args", async () => {
      const result = await UserStripeConnectAccount.createOne({
        userID: MOCK_USER_SCAs.SCA_A.userID,
        ...MOCK_USERS.USER_A,
      });
      expect(result).toEqual({
        ...MOCK_USER_SCAs.SCA_A,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("UserStripeConnectAccount.deleteItem()", () => {
    test(`returns a deleted UserStripeConnectAccount's "userID"`, async () => {
      const { userID } = await UserStripeConnectAccount.deleteItem({
        userID: MOCK_USER_SCAs.SCA_A.userID,
      });
      expect(userID).toEqual(MOCK_USER_SCAs.SCA_A.userID);
    });
  });
});
