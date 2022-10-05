import { jest } from "@jest/globals";
import moment from "moment";
import { ddbSingleTable } from "@lib/dynamoDB";
import { ENV } from "@server/env";
import { USER_ID_REGEX } from "@models/User/regex";
import { UserSubscription } from "./UserSubscription";
import { USER_SUBSCRIPTION_SK_REGEX, STRIPE_SUB_ID_REGEX } from "./regex";
import type { UserSubscriptionType } from "./types";

// Requires "maxWorkers" to be 1
await ddbSingleTable.ensureTableIsActive();

const SECONDS_PER_DAY = 86400;
const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;

const MOCK_SUB_INPUTS = {
  SUB_A: {
    userID: "USER#b0045de0-43f8-11ed-801e-73fbcb5491b6",
    id: "sub_11111111111111",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.MONTHLY,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + MILLISECONDS_PER_DAY * 30), // + 30 days
    createdAt: new Date(Date.now() - MILLISECONDS_PER_DAY * 30) //         - 30 days
  },
  SUB_B: {
    userID: "USER#b1e1f780-43f8-11ed-801e-73fbcb5491b6",
    id: "sub_22222222222222",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.TRIAL,
    status: "trialing",
    currentPeriodEnd: new Date(Date.now() + MILLISECONDS_PER_DAY * 10), // + 10 days
    createdAt: new Date()
  },
  SUB_C: {
    userID: "USER#33333333-3333-3333-3333-333333333333",
    id: "sub_33333333333333",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.TRIAL,
    status: "incomplete_expired",
    currentPeriodEnd: new Date(Date.now() - MILLISECONDS_PER_DAY), // - 10 days (expired)
    createdAt: new Date(Date.now() - MILLISECONDS_PER_DAY * 30) //    - 30 days
  }
} as const;

jest.setTimeout(15000); // 15s

const testSubFields = (
  mockSubKey: keyof typeof MOCK_SUB_INPUTS,
  mockSubInstance: UserSubscriptionType
) => {
  const mockUserSubInputs = MOCK_SUB_INPUTS[mockSubKey];

  expect(mockSubInstance.userID).toMatch(USER_ID_REGEX);
  expect(mockSubInstance.sk).toMatch(USER_SUBSCRIPTION_SK_REGEX);
  expect(mockSubInstance.id).toMatch(STRIPE_SUB_ID_REGEX);

  expect(mockSubInstance.status).toEqual(MOCK_SUB_INPUTS[mockSubKey].status);
  expect(mockSubInstance.productID).toEqual(UserSubscription.PRODUCT_IDS.FIXIT_SUBSCRIPTION);
  expect(mockSubInstance.priceID).toEqual(mockUserSubInputs.priceID);

  expect(moment(mockSubInstance.currentPeriodEnd).isValid()).toEqual(true);
  expect(moment(mockSubInstance.createdAt).isValid()).toEqual(true);
  expect(moment(mockSubInstance.updatedAt).isValid()).toEqual(true);
};

describe("UserSubscription model R/W database operations", () => {
  // prettier-ignore
  let createdSubs: Partial<Record<keyof typeof MOCK_SUB_INPUTS, UserSubscriptionType>> = {};

  // Write mock UserSubscriptions to Table
  beforeAll(async () => {
    for (const mockSubKey in MOCK_SUB_INPUTS) {
      const subInput = MOCK_SUB_INPUTS[mockSubKey as keyof typeof MOCK_SUB_INPUTS];

      const createdSub = await UserSubscription.upsertItem(subInput);
      createdSubs[mockSubKey as keyof typeof MOCK_SUB_INPUTS] = createdSub as UserSubscriptionType;
    }
  });

  test("User.upsertItem returns expected keys and values", () => {
    Object.entries(createdSubs).forEach(([mockSubKey, createdSub]) => {
      testSubFields(mockSubKey as keyof typeof MOCK_SUB_INPUTS, createdSub);
    });
  });

  test("UserSubscription.queryUserSubscriptions returns expected keys and values", async () => {
    // Get mock UserSubscriptions by userID
    for (const mockSubKey in createdSubs) {
      // Each user should only have the 1 subscription
      const subscriptions = await UserSubscription.queryUserSubscriptions(
        createdSubs[mockSubKey as keyof typeof MOCK_SUB_INPUTS]!.userID as string
      );

      subscriptions.forEach((sub) => {
        testSubFields(mockSubKey as keyof typeof MOCK_SUB_INPUTS, sub);
      });
    }
  });

  test("UserSubscription.validateExisting only throws on invalid/expired subscription", async () => {
    expect(() => {
      // Valid subs
      UserSubscription.validateExisting(createdSubs.SUB_A as NonNullable<typeof createdSubs.SUB_C>);
      UserSubscription.validateExisting(createdSubs.SUB_B as NonNullable<typeof createdSubs.SUB_C>);
    }).not.toThrow();

    expect(() => {
      // Invalid sub
      UserSubscription.validateExisting(createdSubs.SUB_C as NonNullable<typeof createdSubs.SUB_C>);
    }).toThrow();
  });
});
