import { normalizeInput, prettifyStr } from "@utils";
import { User } from "./User";
import { USER_ID_REGEX, USER_SK_REGEX, USER_STRIPE_CUSTOMER_ID_REGEX } from "./regex";
import type { UserType } from "./types";

const MOCK_INPUTS = {
  USER_A: {
    email: "userA@gmail.com",
    phone: "888-111-1111",
    expoPushToken: "ExponentPushToken[AAAAAAAAAAAAAAAAAAAAAA]",
    password: "foo_password_unhashed_text"
  },
  USER_B: {
    email: "user_B@gmail.com",
    phone: "888-222-2222",
    expoPushToken: "ExponentPushToken[BBBBBBBBBBBBBBBBBBBBBB]",
    googleID: "userB_googleID",
    googleAccessToken: "userB_gat",
    profile: {
      givenName: "Rick",
      familyName: "Sanchez",
      businessName: "Science Inc."
    }
  }
} as const;

const testUserFields = (mockInputsKey: keyof typeof MOCK_INPUTS, mockUser: UserType) => {
  const mockUserInputs = MOCK_INPUTS[mockInputsKey];

  expect(mockUser.id).toMatch(USER_ID_REGEX);
  expect(mockUser.sk).toMatch(USER_SK_REGEX);
  expect(mockUser.email).toMatch(mockUserInputs.email);
  expect(mockUser.phone).toMatch(prettifyStr.phone(normalizeInput.phone(mockUserInputs.phone)));
  expect(mockUser.stripeCustomerID).toMatch(USER_STRIPE_CUSTOMER_ID_REGEX);
  expect(mockUser.expoPushToken).toMatch(mockUserInputs.expoPushToken);

  if (mockUserInputs === MOCK_INPUTS.USER_A) {
    expect(mockUser?.profile).toBeUndefined();
    expect(mockUser.login).toMatchObject({
      type: "LOCAL",
      passwordHash: expect.stringMatching(/\S{30,}/i)
    });
  } else if (mockUserInputs === MOCK_INPUTS.USER_B) {
    expect(mockUser.profile).toMatchObject(MOCK_INPUTS.USER_B.profile);
    expect(mockUser.login).toMatchObject({
      type: "GOOGLE_OAUTH",
      googleID: MOCK_INPUTS.USER_B.googleID,
      googleAccessToken: MOCK_INPUTS.USER_B.googleAccessToken
    });
  }
};

describe("User model R/W database operations", () => {
  let createdUsers: Partial<Record<keyof typeof MOCK_INPUTS, UserType>> = {};

  // Write mock Users to Table
  beforeAll(async () => {
    for (const mockInputsKey in MOCK_INPUTS) {
      // prettier-ignore
      const createdUser = await User.createOne(MOCK_INPUTS[mockInputsKey as keyof typeof MOCK_INPUTS])
      createdUsers[mockInputsKey as keyof typeof MOCK_INPUTS] = createdUser;
    }
  });

  test("User.createOne returns expected keys and values", () => {
    Object.entries(createdUsers).forEach(([mockInputsKey, createdUser]) => {
      testUserFields(mockInputsKey as keyof typeof MOCK_INPUTS, createdUser);
    });
  });

  test("User.getUserByID returns expected keys and values", async () => {
    // Get mock Users by email
    for (const mockInputsKey in createdUsers) {
      const userID = createdUsers[mockInputsKey as keyof typeof MOCK_INPUTS]!.id;

      const result = await User.getUserByID(userID);

      testUserFields(mockInputsKey as keyof typeof MOCK_INPUTS, result);
    }
  });

  test("User.batchGetUsersByID returns expected keys and values", async () => {
    const users = await User.batchGetUsersByID([createdUsers.USER_A!.id, createdUsers.USER_B!.id]);

    users.forEach((user) => {
      testUserFields(user.id === createdUsers.USER_A!.id ? "USER_A" : "USER_B", user);
    });
  });

  test("User.queryUserByEmail returns expected keys and values", async () => {
    // Get mock Users by email
    for (const mockInputsKey in MOCK_INPUTS) {
      const { email } = MOCK_INPUTS[mockInputsKey as keyof typeof MOCK_INPUTS];

      const result = await User.queryUserByEmail(email);

      testUserFields(mockInputsKey as keyof typeof MOCK_INPUTS, result);
    }
  });

  // After tests are complete, delete mock Users from Table
  afterAll(async () => {
    // batchDeleteItems called from ddbClient to circumvent toDB IO hook actions
    await User.ddbClient.batchDeleteItems(
      Object.values(createdUsers as Record<string, { id: string; sk: string }>).map((user) => ({
        pk: user.id,
        sk: user.sk
      }))
    );
  });
});
