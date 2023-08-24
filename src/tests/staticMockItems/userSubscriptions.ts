import { userSubscriptionModelHelpers as subModelHelpers } from "@/models/UserSubscription/helpers";
import { MOCK_DATES, MOCK_DATE_v1_UUIDs as UUIDs } from "./dates";
import { MOCK_USERS } from "./users";
import type {
  UserSubscriptionModelItem,
  UnaliasedUserSubscriptionModelItem,
} from "@/models/UserSubscription";
import type { MocksCollection } from "./_types";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

export const MOCK_USER_SUBS: MocksCollection<"Sub", UserSubscriptionModelItem> = {
  /** Mock UserSubscription for `USER_A` */
  SUB_A: {
    userID: USER_A.id,
    sk: subModelHelpers.sk.formatWithExistingTimestampUUID(USER_A.id, UUIDs.JAN_1_2020),
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
    sk: subModelHelpers.sk.formatWithExistingTimestampUUID(USER_B.id, UUIDs.JAN_2_2020),
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
    sk: subModelHelpers.sk.formatWithExistingTimestampUUID(USER_C.id, UUIDs.JAN_3_2020),
    id: "sub_CCCCCCCCCCCCCCCCCCCCCCCC",
    status: "active",
    currentPeriodEnd: MOCK_DATES.JAN_1_2021,
    productID: "prod_TestTestTest",
    priceID: "price_TestMONTHLY",
    createdAt: MOCK_DATES.JAN_3_2020,
    updatedAt: MOCK_DATES.JAN_3_2020,
  },
};

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
) as MocksCollection<"Sub", UnaliasedUserSubscriptionModelItem>;