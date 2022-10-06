import moment from "moment";
import { USER_ID_REGEX } from "@models/User/regex";
import { UserStripeConnectAccount } from "./UserStripeConnectAccount";
import { STRIPE_CONNECT_ACCOUNT_SK_REGEX, STRIPE_CONNECT_ACCOUNT_STRIPE_ID_REGEX } from "./regex";
import type { UserStripeConnectAccountType } from "./types";

const MOCK_INPUTS = {
  USER_A: {
    userID: "USER#11111111-1111-1111-1111-sca111111111",
    email: "userA@gmail.com",
    phone: "888-111-1111"
  },
  USER_B: {
    userID: "USER#22222222-2222-2222-2222-sca222222222",
    email: "user_B@gmail.com",
    phone: "888-222-2222",
    profile: {
      givenName: "Rick",
      familyName: "Sanchez",
      businessName: "Science Inc."
    }
  }
} as const;

const testUserFields = (mockUserSCA: UserStripeConnectAccountType) => {
  expect(mockUserSCA.userID).toMatch(USER_ID_REGEX);
  expect(mockUserSCA.sk).toMatch(STRIPE_CONNECT_ACCOUNT_SK_REGEX);
  expect(mockUserSCA.id).toMatch(STRIPE_CONNECT_ACCOUNT_STRIPE_ID_REGEX);
  expect(mockUserSCA.detailsSubmitted).toEqual(false);
  expect(mockUserSCA.chargesEnabled).toEqual(false);
  expect(mockUserSCA.payoutsEnabled).toEqual(false);
  expect(moment(mockUserSCA.createdAt).isValid()).toEqual(true);
  expect(moment(mockUserSCA.updatedAt).isValid()).toEqual(true);
};

describe("UserStripeConnectAccount model R/W database operations", () => {
  let createdUserSCAs: Partial<Record<keyof typeof MOCK_INPUTS, UserStripeConnectAccountType>> = {};

  // Write mock UserStripeConnectAccounts to Table
  beforeAll(async () => {
    for (const mockInputsKey in MOCK_INPUTS) {
      // prettier-ignore
      const createdUser = await UserStripeConnectAccount.createOne(MOCK_INPUTS[mockInputsKey as keyof typeof MOCK_INPUTS])
      createdUserSCAs[mockInputsKey as keyof typeof MOCK_INPUTS] = createdUser;
    }
  });

  test("UserStripeConnectAccount.createOne returns expected keys and values", () => {
    Object.values(createdUserSCAs).forEach((createdUserSCA) => {
      testUserFields(createdUserSCA);
    });
  });

  // After tests are complete, delete mock Subs from Table
  afterAll(async () => {
    // batchDeleteItems called from ddbClient to circumvent toDB IO hook actions
    await UserStripeConnectAccount.ddbClient.batchDeleteItems(
      Object.values(createdUserSCAs as Record<string, { userID: string; sk: string }>).map(
        (userSCA) => ({
          pk: userSCA.userID,
          sk: userSCA.sk
        })
      )
    );
  });
});
