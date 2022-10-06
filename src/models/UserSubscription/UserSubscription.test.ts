import moment from "moment";
import { ENV } from "@server/env";
import { USER_ID_REGEX } from "@models/User/regex";
import { MILLISECONDS_PER_DAY } from "@tests/datetime";
import { UserSubscription } from "./UserSubscription";
import { USER_SUBSCRIPTION_SK_REGEX, USER_SUB_STRIPE_ID_REGEX } from "./regex";
import type { UserSubscriptionType } from "./types";

const MOCK_INPUTS = {
  SUB_A: {
    userID: "USER#11111111-1111-1111-1111-sub111111111",
    id: "sub_11111111111111",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.MONTHLY,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + MILLISECONDS_PER_DAY * 30), // + 30 days
    createdAt: new Date(Date.now() - MILLISECONDS_PER_DAY * 30) //         - 30 days
  },
  SUB_B: {
    userID: "USER#22222222-2222-2222-2222-sub222222222",
    id: "sub_22222222222222",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.TRIAL,
    status: "trialing",
    currentPeriodEnd: new Date(Date.now() + MILLISECONDS_PER_DAY * 10), // + 10 days
    createdAt: new Date()
  },
  SUB_C: {
    userID: "USER#33333333-3333-3333-3333-sub333333333",
    id: "sub_33333333333333",
    productID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.productID,
    priceID: ENV.STRIPE.BILLING.FIXIT_SUBSCRIPTION.priceIDs.TRIAL,
    status: "incomplete_expired",
    currentPeriodEnd: new Date(Date.now() - MILLISECONDS_PER_DAY), // - 10 days (expired)
    createdAt: new Date(Date.now() - MILLISECONDS_PER_DAY * 30) //    - 30 days
  }
} as const;

const testSubFields = (mockInputsKey: keyof typeof MOCK_INPUTS, mockSub: UserSubscriptionType) => {
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
  // prettier-ignore
  let createdSubs: Partial<Record<keyof typeof MOCK_INPUTS, UserSubscriptionType>> = {};

  // Write mock UserSubscriptions to Table
  beforeAll(async () => {
    for (const mockInputsKey in MOCK_INPUTS) {
      const subInput = MOCK_INPUTS[mockInputsKey as keyof typeof MOCK_INPUTS];

      const createdSub = await UserSubscription.upsertItem(subInput);
      createdSubs[mockInputsKey as keyof typeof MOCK_INPUTS] = createdSub as UserSubscriptionType;
    }
  });

  test("User.upsertItem returns expected keys and values", () => {
    Object.entries(createdSubs).forEach(([mockInputsKey, createdSub]) => {
      testSubFields(mockInputsKey as keyof typeof MOCK_INPUTS, createdSub);
    });
  });

  test("UserSubscription.queryUserSubscriptions returns expected keys and values", async () => {
    // Get mock UserSubscriptions by userID
    for (const mockInputsKey in createdSubs) {
      // Each user should only have the 1 subscription
      const subscriptions = await UserSubscription.queryUserSubscriptions(
        createdSubs[mockInputsKey as keyof typeof MOCK_INPUTS]!.userID as string
      );

      subscriptions.forEach((sub) => {
        testSubFields(mockInputsKey as keyof typeof MOCK_INPUTS, sub);
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

  // After tests are complete, delete mock Subs from Table
  afterAll(async () => {
    // batchDeleteItems called from ddbClient to circumvent toDB IO hook actions
    await UserSubscription.ddbClient.batchDeleteItems(
      Object.values(createdSubs as Record<string, { userID: string; sk: string }>).map((sub) => ({
        pk: sub.userID,
        sk: sub.sk
      }))
    );
  });
});
