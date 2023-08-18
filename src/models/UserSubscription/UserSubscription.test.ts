import { MOCK_USERS, MOCK_USER_SUBS } from "@/tests/staticMockItems";
import { UserSubscription } from "./UserSubscription";
import { userSubscriptionModelHelpers as subModelHelpers } from "./helpers";

/**
 * NOTE: The following packages are mocked before these tests are run:
 * - `@aws-sdk/lib-dynamodb`
 * - `stripe`
 *
 * See Vitest setup file `src/tests/setupTests.ts`
 */

describe("UserSubscription Model", () => {
  describe("UserSubscription.upsertOne()", () => {
    test("returns a valid UserSubscription when called with valid args", async () => {
      const result = await UserSubscription.upsertOne({
        user: MOCK_USERS.USER_A,
        selectedSubscription: "ANNUAL",
        priceID: MOCK_USER_SUBS.SUB_A.priceID,
      });
      expect(result).toMatchObject({
        ...MOCK_USER_SUBS.SUB_A,
        sk: expect.toSatisfyFn((value: string) => subModelHelpers.sk.isValid(value)),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("UserSubscription.query()", () => {
    test(`returns desired UserSubscription when queried by "userID"`, async () => {
      for (const key in MOCK_USER_SUBS) {
        const results = await UserSubscription.query({
          where: {
            userID: MOCK_USER_SUBS[key].userID,
            sk: { beginsWith: UserSubscription.SK_PREFIX },
          },
          limit: 1,
        });
        expect(results).toHaveLength(1);
        expect(results).toOnlyContain({
          ...MOCK_USER_SUBS[key],
          sk: expect.toSatisfyFn((value: string) => subModelHelpers.sk.isValid(value)),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });
  });

  // TODO Make tests for UserSubscription.updateItem()
  describe.todo("UserSubscription.updateItem()");

  describe("UserSubscription.deleteItem()", () => {
    test(`returns a deleted UserSubscription's ID`, async () => {
      for (const key in MOCK_USER_SUBS) {
        const { userID, sk, id: stripeSubID } = MOCK_USER_SUBS[key];
        const result = await UserSubscription.deleteItem({ userID, sk });
        expect(result?.id).toEqual(stripeSubID);
      }
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
