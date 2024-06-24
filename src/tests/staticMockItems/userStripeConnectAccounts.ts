import { scaModelHelpers } from "@/models/UserStripeConnectAccount/helpers.js";
import { MOCK_DATES } from "./dates.js";
import { MOCK_USERS } from "./users.js";
import type {
  UserStripeConnectAccountItem,
  UnaliasedUserStripeConnectAccountItem,
} from "@/models/UserStripeConnectAccount";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

export const MOCK_USER_SCAs = {
  /** Mock UserStripeConnectAccount for `USER_A` */
  SCA_A: {
    userID: USER_A.id,
    sk: scaModelHelpers.sk.format(USER_A.id),
    id: "acct_AAAAAAAAAAAAAAAAAAAAAAAA",
    detailsSubmitted: true,
    chargesEnabled: true,
    payoutsEnabled: true,
    createdAt: MOCK_DATES.JAN_1_2020,
    updatedAt: MOCK_DATES.JAN_1_2020,
  },
  /** Mock UserStripeConnectAccount for `USER_B` */
  SCA_B: {
    userID: USER_B.id,
    sk: scaModelHelpers.sk.format(USER_B.id),
    id: "acct_BBBBBBBBBBBBBBBBBBBBBBBB",
    detailsSubmitted: true,
    chargesEnabled: true,
    payoutsEnabled: true,
    createdAt: MOCK_DATES.JAN_2_2020,
    updatedAt: MOCK_DATES.JAN_2_2020,
  },
  /** Mock UserStripeConnectAccount for `USER_C` */
  SCA_C: {
    userID: USER_C.id,
    sk: scaModelHelpers.sk.format(USER_C.id),
    id: "acct_CCCCCCCCCCCCCCCCCCCCCCCC",
    detailsSubmitted: true,
    chargesEnabled: true,
    payoutsEnabled: true,
    createdAt: MOCK_DATES.JAN_3_2020,
    updatedAt: MOCK_DATES.JAN_3_2020,
  },
} as const satisfies Record<string, UserStripeConnectAccountItem>;

/** Unaliased mock UserStripeConnectAccounts for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_MOCK_USER_SCAs = Object.fromEntries(
  Object.entries(MOCK_USER_SCAs).map(([key, { userID, id, ...stripeConnectAccount }]) => [
    key,
    {
      pk: userID,
      data: id,
      ...stripeConnectAccount,
    },
  ])
) as { [Key in keyof typeof MOCK_USER_SCAs]: UnaliasedUserStripeConnectAccountItem };
