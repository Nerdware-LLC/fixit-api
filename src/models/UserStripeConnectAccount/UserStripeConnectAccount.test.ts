import moment from "moment";
import { USER_ID_REGEX } from "@models/User/regex";
import {
  UserStripeConnectAccount,
  type UserStripeConnectAccountModelItem,
} from "./UserStripeConnectAccount";
import { STRIPE_CONNECT_ACCOUNT_SK_REGEX, STRIPE_CONNECT_ACCOUNT_STRIPE_ID_REGEX } from "./regex";

const MOCK_INPUTS = {
  USER_A: {
    userID: "USER#11111111-1111-1111-1111-sca111111111",
    email: "userA@gmail.com",
    phone: "888-111-1111",
  },
  USER_B: {
    userID: "USER#22222222-2222-2222-2222-sca222222222",
    email: "user_B@gmail.com",
    phone: "888-222-2222",
    profile: {
      givenName: "Rick",
      familyName: "Sanchez",
      businessName: "Science Inc.",
    },
  },
} as const;

type MockInputKey = keyof typeof MOCK_INPUTS;
// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<MockInputKey>;

const testUserFields = (mockUserSCA: UserStripeConnectAccountModelItem) => {
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
  const createdUserSCAs = {} as {
    [K in MockInputKey]: Awaited<ReturnType<typeof UserStripeConnectAccount.createOne>>;
  };

  // Write mock UserStripeConnectAccounts to Table
  beforeAll(async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // prettier-ignore
      const createdUser = await UserStripeConnectAccount.createOne(MOCK_INPUTS[key] as any);
      createdUserSCAs[key] = createdUser;
    }
  });

  test("UserStripeConnectAccount.createOne returns expected keys and values", () => {
    Object.values(createdUserSCAs).forEach((createdUserSCA) => {
      testUserFields(createdUserSCA);
    });
  });

  // TODO Test UserStripeConnectAccount updateItem

  // DELETE:

  test("UserStripeConnectAccount.deleteItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { userID, sk } = createdUserSCAs[key];
      // If deleteItem did not error out, the delete succeeded, check userID.
      // prettier-ignore
      const { userID: userIDofDeletedUserSCA } = await UserStripeConnectAccount.deleteItem({ userID, sk });
      expect(userIDofDeletedUserSCA).toEqual(userID);
    }
  });
});

// ENSURE MOCK RESOURCE CLEANUP:

afterAll(async () => {
  /* After all tests are complete, ensure all mock Items created here have been deleted.
  Note: DDB methods are called from the ddbClient to circumvent toDB IO hook actions. */

  const remainingMockUserSCAs = await UserStripeConnectAccount.ddbClient.scan({
    FilterExpression: "begins_with(pk, :skPrefix)",
    ExpressionAttributeValues: { ":skPrefix": "STRIPE_CONNECT_ACCOUNT#" },
  });

  if (Array.isArray(remainingMockUserSCAs) && remainingMockUserSCAs.length > 0) {
    await UserStripeConnectAccount.ddbClient.batchDeleteItems(
      remainingMockUserSCAs.map(({ pk, sk }) => ({ pk, sk }))
    );
  }
});
