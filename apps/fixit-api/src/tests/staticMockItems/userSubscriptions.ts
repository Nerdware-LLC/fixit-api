import {
  UserSubscription,
  type UserSubscriptionItem,
  type UnaliasedUserSubscriptionItem,
} from "@/models/UserSubscription";
import { MOCK_DATES } from "./dates.js";
import { MOCK_USERS } from "./users.js";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

export const MOCK_USER_SUBS = {
  /** Mock UserSubscription for `USER_A` */
  SUB_A: {
    userID: USER_A.id,
    sk: UserSubscription.getFormattedSK(USER_A.id, MOCK_DATES.JAN_1_2020),
    id: "sub_AAAAAAAAAAAAAAAAAAAAAAAA",
    status: "active",
    currentPeriodEnd: MOCK_DATES.JAN_1_2021,
    productID: "prod_TestTestTest",
    priceID: "price_TestANNUAL",
    createdAt: MOCK_DATES.JAN_1_2020,
    updatedAt: MOCK_DATES.JAN_1_2020,
  },
  /** Mock UserSubscription for `USER_B` */
  SUB_B: {
    userID: USER_B.id,
    sk: UserSubscription.getFormattedSK(USER_B.id, MOCK_DATES.JAN_2_2020),
    id: "sub_BBBBBBBBBBBBBBBBBBBBBBBB",
    status: "active",
    currentPeriodEnd: MOCK_DATES.JAN_1_2021,
    productID: "prod_TestTestTest",
    priceID: "price_TestANNUAL",
    createdAt: MOCK_DATES.JAN_2_2020,
    updatedAt: MOCK_DATES.JAN_2_2020,
  },
  /** Mock UserSubscription for `USER_C` */
  SUB_C: {
    userID: USER_C.id,
    sk: UserSubscription.getFormattedSK(USER_C.id, MOCK_DATES.JAN_3_2020),
    id: "sub_CCCCCCCCCCCCCCCCCCCCCCCC",
    status: "active",
    currentPeriodEnd: MOCK_DATES.JAN_1_2021,
    productID: "prod_TestTestTest",
    priceID: "price_TestMONTHLY",
    createdAt: MOCK_DATES.JAN_3_2020,
    updatedAt: MOCK_DATES.JAN_3_2020,
  },
} as const satisfies Record<string, UserSubscriptionItem>;

/** Unaliased mock UserSubscriptions for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_MOCK_USER_SUBS = Object.fromEntries(
  Object.entries(MOCK_USER_SUBS).map(([key, { userID, id, ...subscription }]) => [
    key,
    {
      pk: userID,
      data: id,
      ...subscription,
    },
  ])
) as { [Key in keyof typeof MOCK_USER_SUBS]: UnaliasedUserSubscriptionItem };
