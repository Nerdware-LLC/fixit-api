import { jest } from "@jest/globals";
import { User, type UserType } from "@models/User";
import { USER_ID_REGEX, USER_SK_REGEX, USER_STRIPE_CUSTOMER_ID_REGEX } from "@models/User/regex";
import { normalizeInput, prettifyStr } from "@utils";

const MOCK_USERS = {
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

const MOCK_USERS_EXPECTED_LOGIN_AND_PROFILE_FIELDS = new WeakMap();

MOCK_USERS_EXPECTED_LOGIN_AND_PROFILE_FIELDS.set(MOCK_USERS.USER_A, {
  login: {
    type: "LOCAL",
    passwordHash: expect.stringMatching(/\S{30,}/i)
  },
  profile: {}
});

MOCK_USERS_EXPECTED_LOGIN_AND_PROFILE_FIELDS.set(MOCK_USERS.USER_B, {
  login: {
    type: "GOOGLE_OAUTH",
    googleID: "userB_googleID",
    googleAccessToken: "userB_gat"
  },
  profile: {
    givenName: "Rick",
    familyName: "Sanchez",
    businessName: "Science Inc."
  }
});

jest.setTimeout(15000); // 15s

const testUserFields = (mockUserKey: keyof typeof MOCK_USERS, userInstanceObj: UserType) => {
  const mockUserInputs = MOCK_USERS[mockUserKey];

  expect(userInstanceObj.id).toMatch(USER_ID_REGEX);
  expect(userInstanceObj.sk).toMatch(USER_SK_REGEX);
  expect(userInstanceObj.email).toMatch(mockUserInputs.email);
  expect(userInstanceObj.phone).toMatch(
    prettifyStr.phone(normalizeInput.phone(mockUserInputs.phone))
  );
  expect(userInstanceObj.stripeCustomerID).toMatch(USER_STRIPE_CUSTOMER_ID_REGEX);
  expect(userInstanceObj.expoPushToken).toMatch(mockUserInputs.expoPushToken);

  // prettier-ignore
  const { login: expectedLogin, profile: expectedProfile } = MOCK_USERS_EXPECTED_LOGIN_AND_PROFILE_FIELDS.get(mockUserInputs);

  expect(userInstanceObj.login).toMatchObject(expectedLogin);
  expect(userInstanceObj?.profile ?? {}).toMatchObject(expectedProfile);
};

describe("User model R/W database operations", () => {
  let createdUsers: Partial<Record<keyof typeof MOCK_USERS, UserType>> = {};

  // Write mock Users to Table
  beforeAll(async () => {
    for (const mockUserKey in MOCK_USERS) {
      // prettier-ignore
      const createdUser = await User.createOne(MOCK_USERS[mockUserKey as keyof typeof MOCK_USERS])
      createdUsers[mockUserKey as keyof typeof MOCK_USERS] = createdUser;
    }
  });

  test("User.createOne returns expected keys and values", () => {
    Object.entries(createdUsers).forEach(([mockUserKey, createdUser]) => {
      testUserFields(mockUserKey as keyof typeof MOCK_USERS, createdUser);
    });
  });

  test("User.getUserByID returns expected keys and values", async () => {
    // Get mock Users by email
    for (const mockUserKey in createdUsers) {
      const userID = createdUsers[mockUserKey as keyof typeof MOCK_USERS]!.id;

      const result = await User.getUserByID(userID);

      testUserFields(mockUserKey as keyof typeof MOCK_USERS, result as UserType);
    }
  });

  test("User.batchGetUsersByID returns expected keys and values", async () => {
    const users = await User.batchGetUsersByID([
      createdUsers!.USER_A!.id,
      createdUsers!.USER_B!.id
    ]);

    (users as Array<UserType>).forEach((user) => {
      testUserFields(user.id === createdUsers!.USER_A!.id ? "USER_A" : "USER_B", user as UserType);
    });
  });

  test("User.queryUserByEmail returns expected keys and values", async () => {
    // Get mock Users by email
    for (const mockUserKey in MOCK_USERS) {
      const { email } = MOCK_USERS[mockUserKey as keyof typeof MOCK_USERS];

      const result = await User.queryUserByEmail(email);

      testUserFields(mockUserKey as keyof typeof MOCK_USERS, result as UserType);
    }
  });
});
