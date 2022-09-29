import { jest } from "@jest/globals";
import { User } from "@models/User";
import { USER_ID_REGEX, USER_SK_REGEX, USER_STRIPE_CUSTOMER_ID_REGEX } from "@models/User/regex";
import { normalizeInput, prettifyStr } from "@utils";

/* Symbol purpose: store unique `expect` fields in MOCKS.USERS; the symbols don't
get passed into dynamoose, and therefore don't cause input validation errors.  */
const USER_SPECIFIC_EXPECT_FIELDS = Symbol("MOCK_USERS_JEST_EXPECT_FIELDS");

const MOCK_USERS = {
  USER_A: {
    email: "userA@gmail.com",
    phone: "888-111-1111",
    expoPushToken: "ExponentPushToken[AAAAAAAAAAAAAAAAAAAAAA]",
    password: "foo_password_unhashed_text",
    // Fields to `expect` for USER_A which A and B don't have in common:
    [USER_SPECIFIC_EXPECT_FIELDS]: {
      login: {
        type: "LOCAL",
        passwordHash: expect.stringMatching(/\S{30,}/i)
      }
    }
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
    },
    // Fields to `expect` for USER_B which A and B don't have in common:
    [USER_SPECIFIC_EXPECT_FIELDS]: {
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
    }
  }
};

jest.setTimeout(15000); // 15s

describe("User model R/W database operations", () => {
  const createdUsers = {};

  // Write mock Users to Table
  beforeAll(async () => {
    for (const mockUserKey in MOCK_USERS) {
      const createdUser = await User.createOne(MOCK_USERS[mockUserKey]);
      createdUsers[mockUserKey] = createdUser;
    }
  });

  test("User.createOne returns expected keys and values", () => {
    Object.entries(createdUsers).forEach(([mockUserKey, createdUser]) => {
      const mockUser = MOCK_USERS[mockUserKey];
      // Expected fields USER_A and USER_B have in common:

      expect(createdUser?.id).toMatch(USER_ID_REGEX);
      expect(createdUser?.sk).toMatch(USER_SK_REGEX);
      expect(createdUser?.email).toMatch(mockUser.email);
      expect(createdUser?.phone).toMatch(prettifyStr.phone(normalizeInput.phone(mockUser.phone)));
      expect(createdUser?.stripeCustomerID).toMatch(USER_STRIPE_CUSTOMER_ID_REGEX);
      expect(createdUser?.expoPushToken).toMatch(mockUser.expoPushToken);
      // Expected fields which are specific to the mock users:
      expect(createdUser?.login).toMatchObject(mockUser[USER_SPECIFIC_EXPECT_FIELDS].login);
      expect(createdUser?.profile ?? {}).toMatchObject(
        mockUser[USER_SPECIFIC_EXPECT_FIELDS]?.profile ?? {}
      );
    });
  });

  /* For each test, ensure that
    (1) the value read from db passes field validation, and
    (2) the value read from db matches the createOne output, where applicable.
  */

  test("User.queryUserByEmail returns expected keys and values", async () => {
    // Get mock Users by email
    for (const mockUserKey in MOCK_USERS) {
      const user = MOCK_USERS[mockUserKey];

      console.debug(`

      [DEBUG] BEFORE QUERY, user: ${JSON.stringify(user, null, 2)}

      `);
      // prettier-ignore
      const userQueryResult = await User.query("email").eq(user.email).using("Overloaded_Data_GSI").exec();

      // const userQueryResult = await User.query({ email: { eq: user.email } }).using("Overloaded_Data_GSI").exec();

      console.debug(`

      [DEBUG] userQueryResult: ${JSON.stringify(userQueryResult, null, 2)}

      `);

      // Expected fields USER_A and USER_B have in common:
      expect(userQueryResult?.id).toMatch(USER_ID_REGEX);
      expect(userQueryResult?.sk).toMatch(USER_SK_REGEX);
      expect(userQueryResult?.email).toMatch(user.email);
      expect(userQueryResult?.phone).toMatch(prettifyStr.phone(normalizeInput.phone(user.phone)));
      expect(userQueryResult?.stripeCustomerID).toMatch(USER_STRIPE_CUSTOMER_ID_REGEX);
      expect(userQueryResult?.expoPushToken).toMatch(user.expoPushToken);
      // Expected fields which are specific to the mock users:
      expect(userQueryResult?.login).toMatchObject(user[USER_SPECIFIC_EXPECT_FIELDS].login);
      expect(userQueryResult?.profile ?? {}).toMatchObject(
        user[USER_SPECIFIC_EXPECT_FIELDS]?.profile ?? {}
      );
    }
  });
});
