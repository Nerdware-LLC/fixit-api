import { normalizeInput, prettifyStr } from "@utils";
import { User, type UserModelItem } from "./User";
import { USER_ID_REGEX, USER_SK_REGEX, USER_STRIPE_CUSTOMER_ID_REGEX } from "./regex";

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

const testUserFields = (
  mockInputsKey: keyof typeof MOCK_INPUTS,
  mockUser: Partial<UserModelItem>
) => {
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
      passwordHash: expect.stringMatching(/\S{30,}/i) as unknown,
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
  const createdUsers = {} as {
    -readonly [K in keyof typeof MOCK_INPUTS]: Partial<UserModelItem>;
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

  test("User.getItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const createdByUserID = createdUsers[key].id || "";

      const result = await User.getItem({
        id: createdByUserID,
        sk: User.getFormattedSK(createdByUserID),
      });

      testUserFields(key, result as UserModelItem);
    }
  });

  test("User.batchGetItems returns expected keys and values", async () => {
    const users = await User.batchGetItems(
      [createdUsers.USER_A.id || "", createdUsers.USER_B.id || ""].map((userID) => ({
        id: userID,
        sk: User.getFormattedSK(userID),
      }))
    );

    users.forEach((user) => {
      testUserFields(user.id === createdUsers.USER_A.id ? "USER_A" : "USER_B", user);
    });
  });

  test("User.query User by email returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // Get mock Users by email
      const [result] = await User.query({ where: { email: MOCK_INPUTS[key].email }, limit: 1 });
      testUserFields(key, result);
    }
  });

  // TODO Test User updateItem

  // DELETE:

  test("User.deleteItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { id = "", sk = "" } = createdUsers[key];
      const deletedUserItem = await User.deleteItem({ id, sk });
      // If deleteItem did not error out, the delete succeeded, check ID.
      expect(deletedUserItem?.id).toEqual(id);
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
    await User.ddbClient.batchDeleteItems(
      remainingMockUsers.map(({ pk, sk }) => ({ pk: pk as string, sk: sk as string }))
    );
  }
});
