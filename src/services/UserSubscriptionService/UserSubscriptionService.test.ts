import { subModelHelpers } from "@/models/UserSubscription/helpers.js";
import { MOCK_USERS, MOCK_USER_SUBS } from "@/tests/staticMockItems";
import { UserSubscriptionService } from "./index.js";

describe("UserSubscriptionService", () => {
  describe("UserSubscriptionService.createSubscription()", () => {
    test("returns a valid UserSubscription when called with valid arguments", async () => {
      // Arrange mock UserSubscriptions
      for (const key in MOCK_USER_SUBS) {
        // Get createSubscription inputs from mock UserSub
        const mockSub = MOCK_USER_SUBS[key as keyof typeof MOCK_USER_SUBS];

        // Ascertain the mock User associated with this mock UserSub
        const associatedMockUser =
          key === "SUB_A"
            ? MOCK_USERS.USER_A
            : key === "SUB_B"
              ? MOCK_USERS.USER_B
              : MOCK_USERS.USER_C;

        // Act on the createSubscription method:
        const { userSubscription, stripeSubscriptionObject } =
          await UserSubscriptionService.createSubscription({
            user: associatedMockUser,
            selectedSubscription: mockSub.priceID.split("price_Test")[1] as any,
            // all mock sub priceIDs are prefixed with "price_Test" (e.g., "price_TestANNUAL")
          });

        // Assert the results
        expect(userSubscription).toStrictEqual({
          ...mockSub,
          sk: expect.toSatisfyFn((value: string) => subModelHelpers.sk.isValid(value)),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
        expect(stripeSubscriptionObject).toBeDefined();
      }
    });
  });
});
