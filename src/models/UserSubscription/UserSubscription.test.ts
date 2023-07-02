import moment from "moment";
import { USER_ID_REGEX } from "@models/User/regex";
import { ENV } from "@server/env";
import { MILLISECONDS_PER_DAY } from "@tests/datetime";
import { UserSubscription, type UserSubscriptionModelItem } from "./UserSubscription";
import { USER_SUBSCRIPTION_SK_REGEX, USER_SUB_STRIPE_ID_REGEX } from "./regex";
import type { Simplify } from "type-fest";

const USER_1 = "USER#11111111-1111-1111-1111-sub111111111";
const USER_2 = "USER#22222222-2222-2222-2222-sub222222222";
const USER_3 = "USER#33333333-3333-3333-3333-sub333333333";

const MOCK_INPUTS = {
  SUB_A: {
    userID: USER_1,
    id: "sub_11111111111111",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.MONTHLY,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + MILLISECONDS_PER_DAY * 30), // + 30 days
    createdAt: new Date(Date.now() - MILLISECONDS_PER_DAY * 30), //         - 30 days
  },
  SUB_B: {
    userID: USER_2,
    id: "sub_22222222222222",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.TRIAL,
    status: "trialing",
    currentPeriodEnd: new Date(Date.now() + MILLISECONDS_PER_DAY * 10), // + 10 days
    createdAt: new Date(),
  },
  SUB_C: {
    userID: USER_3,
    id: "sub_33333333333333",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.TRIAL,
    status: "incomplete_expired",
    currentPeriodEnd: new Date(Date.now() - MILLISECONDS_PER_DAY), // - 10 days (expired)
    createdAt: new Date(Date.now() - MILLISECONDS_PER_DAY * 30), //    - 30 days
  },
} as const;

type MockInputKey = keyof typeof MOCK_INPUTS;
// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<MockInputKey>;

const testSubFields = (mockInputsKey: MockInputKey, mockSub: UserSubscriptionModelItem) => {
  expect(mockSub.userID).toMatch(USER_ID_REGEX);
  expect(mockSub.sk).toMatch(USER_SUBSCRIPTION_SK_REGEX);
  expect(mockSub.id).toMatch(USER_SUB_STRIPE_ID_REGEX);

  expect(mockSub.status).toEqual(MOCK_INPUTS[mockInputsKey].status);
  expect(mockSub.productID).toEqual(UserSubscription.PRODUCT_IDS.FIXIT_SUBSCRIPTION);
  expect(mockSub.priceID).toEqual(MOCK_INPUTS[mockInputsKey].priceID);

  expect(moment(mockSub.currentPeriodEnd).isValid()).toEqual(true);
  expect(moment(mockSub.createdAt).isValid()).toEqual(true);
  expect(moment(mockSub.updatedAt).isValid()).toEqual(true);
};

describe("UserSubscription model R/W database operations", () => {
  const createdSubs = {} as {
    [K in MockInputKey]: Simplify<
      UserSubscriptionModelItem & Required<Pick<UserSubscriptionModelItem, "userID" | "sk">>
    >;
  };

  beforeAll(async () => {
    // Write mock UserSubscriptions to Table
    for (const key of MOCK_INPUT_KEYS) {
      createdSubs[key] = (await UserSubscription.upsertItem(
        MOCK_INPUTS[key]
      )) as Required<UserSubscriptionModelItem>;
    }
  });

  test("UserSubscription.upsertItem returns expected keys and values", () => {
    Object.entries(createdSubs).forEach(([mockInputsKey, createdSub]) => {
      testSubFields(mockInputsKey as MockInputKey, createdSub);
    });
  });

  test("UserSubscription.queryUserSubscriptions returns expected keys and values", async () => {
    // Get mock UserSubscriptions by userID
    for (const key of MOCK_INPUT_KEYS) {
      // Each user should only have the 1 subscription
      const subscriptions = await UserSubscription.queryUserSubscriptions(createdSubs[key].userID);

      subscriptions.forEach((sub) => {
        testSubFields(key, sub);
      });
    }
  });

  test("UserSubscription.validateExisting only throws on invalid/expired subscription", () => {
    expect(() => {
      // Valid subs
      UserSubscription.validateExisting(createdSubs.SUB_A);
      UserSubscription.validateExisting(createdSubs.SUB_B);
    }).not.toThrow();

    expect(() => {
      // Invalid sub
      UserSubscription.validateExisting(createdSubs.SUB_C);
    }).toThrow();
  });

  // TODO Test UserSubscription updateItem

  // DELETE:

  test("UserSubscription.deleteItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { userID, sk } = createdSubs[key];
      // If deleteItem did not error out, the delete succeeded, check userID.
      const { userID: userIDofDeletedSub } = await UserSubscription.deleteItem({ userID, sk });
      expect(userIDofDeletedSub).toEqual(userID);
    }
  });
});

// ENSURE MOCK RESOURCE CLEANUP:

afterAll(async () => {
  /* After all tests are complete, ensure all mock Items created here have been deleted.
  Note: DDB methods are called from the ddbClient to circumvent toDB IO hook actions. */

  const remainingMockSubs = await UserSubscription.ddbClient.scan({
    FilterExpression: "begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: { ":skPrefix": "SUBSCRIPTION#" },
  });

  if (Array.isArray(remainingMockSubs) && remainingMockSubs.length > 0) {
    await UserSubscription.ddbClient.batchDeleteItems(
      remainingMockSubs.map(({ pk, sk }) => ({ pk, sk }))
    );
  }
});
