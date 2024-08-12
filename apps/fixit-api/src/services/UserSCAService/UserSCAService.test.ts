import { isValidStripeID } from "@/lib/stripe/helpers.js";
import { userModelHelpers } from "@/models/User/helpers.js";
import { scaModelHelpers } from "@/models/UserStripeConnectAccount/helpers.js";
import { MOCK_USER_SCAs, MOCK_USERS } from "@/tests/staticMockItems";
import { UserSCAService } from "./index.js";

describe("UserSCAService", () => {
  describe("UserSCAService.registerNewUserSCA()", () => {
    test("returns a valid User when called with valid arguments", async () => {
      // Arrange the inputs
      const input = {
        ...MOCK_USER_SCAs.SCA_A,
        email: MOCK_USERS.USER_A.email,
        phone: MOCK_USERS.USER_A.phone,
        profile: MOCK_USERS.USER_A.profile,
      };

      // Act on the UserStripeConnectAccount Model's createItem method
      const result = await UserSCAService.registerNewUserSCA(input);

      // Assert the result
      expect(result).toStrictEqual({
        userID: expect.toSatisfyFn((value) => userModelHelpers.id.isValid(value)),
        id: expect.toSatisfyFn((value) => isValidStripeID.connectAccount(value)),
        sk: expect.toSatisfyFn((value) => scaModelHelpers.sk.isValid(value)),
        detailsSubmitted: expect.any(Boolean),
        chargesEnabled: expect.any(Boolean),
        payoutsEnabled: expect.any(Boolean),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
