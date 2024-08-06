import { MOCK_USERS, MOCK_USER_SCAs } from "@/tests/staticMockItems";
import { verifyUserIsAuthorizedToAccessPaidContent } from "./verifyUserIsAuthorizedToAccessPaidContent.js";
import type { UserSubscription } from "@/types/graphql.js";
import type { AuthTokenPayload } from "@/types/open-api.js";

describe("verifyUserIsAuthorizedToAccessPaidContent()", () => {
  const YEAR_2000 = new Date(2000, 0);
  const YEAR_9999 = new Date(9999, 0);

  const mockUserWithSubFields = (
    subFieldsToTest: Pick<UserSubscription, "status" | "currentPeriodEnd">
  ): AuthTokenPayload => ({
    ...MOCK_USERS.USER_A,
    stripeConnectAccount: MOCK_USER_SCAs.SCA_A,
    subscription: { id: "", ...subFieldsToTest },
  });

  test(`does not throw when called with a valid "active" subscription`, () => {
    expect(() => {
      verifyUserIsAuthorizedToAccessPaidContent({
        authenticatedUser: mockUserWithSubFields({
          status: "active",
          currentPeriodEnd: YEAR_9999,
        }),
      });
    }).not.toThrow();
  });

  test(`does not throw when called with a valid "trialing" subscription`, () => {
    expect(() => {
      verifyUserIsAuthorizedToAccessPaidContent({
        authenticatedUser: mockUserWithSubFields({
          status: "trialing",
          currentPeriodEnd: YEAR_9999,
        }),
      });
    }).not.toThrow();
  });

  test(`throws an error when called with a subscription with an invalid status`, () => {
    expect(() => {
      verifyUserIsAuthorizedToAccessPaidContent({
        authenticatedUser: mockUserWithSubFields({
          status: "past_due",
          currentPeriodEnd: YEAR_9999,
        }),
      });
    }).toThrow("past due");
  });

  test(`throws an error when called with an expired subscription`, () => {
    expect(() => {
      verifyUserIsAuthorizedToAccessPaidContent({
        authenticatedUser: mockUserWithSubFields({
          status: "active",
          currentPeriodEnd: YEAR_2000,
        }),
      });
    }).toThrow("expired");
  });
});
