import { normalizeInput, prettifyStr } from "@utils";
import { User } from "./User";
import { USER_ID_REGEX, USER_SK_REGEX, USER_STRIPE_CUSTOMER_ID_REGEX } from "./regex";
import type { UserType } from "@types";
import type { Simplify } from "type-fest";

const MOCK_INPUTS = {
  USER_A: {
    handle: "@user_A",
    email: "userA@gmail.com",
    phone: "888-111-1111",
    expoPushToken: "ExponentPushToken[AAAAAAAAAAAAAAAAAAAAAA]",
    password: "foo_password_unhashed_text",
  },
  USER_B: {
    handle: "@user_B",
    email: "user_B@gmail.com",
    phone: "888-222-2222",
    expoPushToken: "ExponentPushToken[BBBBBBBBBBBBBBBBBBBBBB]",
    googleID: "userB_googleID",
    googleAccessToken: "userB_gat",
    profile: {
      displayName: "Rick Sanchez",
      givenName: "Rick",
      familyName: "Sanchez",
      businessName: "Science Inc.",
    },
  },
} as const;

// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<keyof typeof MOCK_INPUTS>;

const testUserFields = (mockInputsKey: keyof typeof MOCK_INPUTS, mockUser: UserType) => {
  const mockUserInputs = MOCK_INPUTS[mockInputsKey];

  expect(mockUser.id).toMatch(USER_ID_REGEX);
  expect(mockUser.sk).toMatch(USER_SK_REGEX);
  expect(mockUser.handle).toMatch(mockUserInputs.handle);
  expect(mockUser.email).toMatch(mockUserInputs.email);
  expect(mockUser.phone).toMatch(prettifyStr.phone(normalizeInput.phone(mockUserInputs.phone)));
  expect(mockUser.stripeCustomerID).toMatch(USER_STRIPE_CUSTOMER_ID_REGEX);
  expect(mockUser.expoPushToken).toMatch(mockUserInputs.expoPushToken);

  if (mockUserInputs === MOCK_INPUTS.USER_A) {
    expect(mockUser?.profile).toBeUndefined();
    expect(mockUser.login).toMatchObject({
      type: "LOCAL",
      passwordHash: expect.stringMatching(/\S{30,}/i),
    });
  } else if (mockUserInputs === MOCK_INPUTS.USER_B) {
    expect(mockUser.profile).toMatchObject(MOCK_INPUTS.USER_B.profile);
    expect(mockUser.login).toMatchObject({
      type: "GOOGLE_OAUTH",
      googleID: MOCK_INPUTS.USER_B.googleID,
      googleAccessToken: MOCK_INPUTS.USER_B.googleAccessToken,
    });
  }
};

describe("User model R/W database operations", () => {
  let createdUsers = {} as {
    -readonly [K in keyof typeof MOCK_INPUTS]: Simplify<UserType & { sk: string }>;
  };

  beforeAll(async () => {
    // Write mock Users to Table
    for (const key of MOCK_INPUT_KEYS) {
      createdUsers[key] = await User.createOne(MOCK_INPUTS[key]);
    }
  });

  test("User.createOne returns expected keys and values", () => {
    Object.entries(createdUsers).forEach(([mockInputsKey, createdUser]) => {
      testUserFields(mockInputsKey as keyof typeof MOCK_INPUTS, createdUser);
    });
  });

  test("User.getUserByID returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const result = await User.getUserByID(createdUsers[key].id);
      testUserFields(key, result);
    }
  });

  test("User.batchGetUsersByID returns expected keys and values", async () => {
    const users = await User.batchGetUsersByID([createdUsers.USER_A!.id, createdUsers.USER_B!.id]);

    users.forEach((user) => {
      testUserFields(user.id === createdUsers.USER_A.id ? "USER_A" : "USER_B", user);
    });
  });

  test("User.queryUserByEmail returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // Get mock Users by email
      const result = await User.queryUserByEmail(MOCK_INPUTS[key].email);
      testUserFields(key, result);
    }
  });

  // TODO Test User updateItem

  // DELETE:

  test("User.deleteItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { id, sk } = createdUsers[key];
      const { id: deletedUserID } = await User.deleteItem({ id, sk });
      // If deleteItem did not error out, the delete succeeded, check ID.
      expect(deletedUserID).toEqual(id);
    }
  });
});

// ENSURE MOCK RESOURCE CLEANUP:

afterAll(async () => {
  /* After all tests are complete, ensure all mock Items created here have been deleted.
  Note: DDB methods are called from the ddbClient to circumvent toDB IO hook actions. */

  const remainingMockUsers = await User.ddbClient.scan({
    FilterExpression: "begins_with(pk, :pkPrefix)",
    ExpressionAttributeValues: { ":pkPrefix": "USER#" },
  });

  if (Array.isArray(remainingMockUsers) && remainingMockUsers.length > 0) {
    await User.ddbClient.batchDeleteItems(remainingMockUsers.map(({ pk, sk }) => ({ pk, sk })));
  }
});
