import { isValidStripeID } from "@/lib/stripe";
import { userStripeConnectAccountModelHelpers as scaModelHelpers } from "@/models/UserStripeConnectAccount/helpers";
import { MOCK_USERS } from "@/tests/staticMockItems";
import { isValid, normalize } from "@/utils/clientInputHandlers";
import { User } from "./User";
import { userModelHelpers } from "./helpers";

/**
 * NOTE: The following packages are mocked before these tests are run:
 * - `@aws-sdk/lib-dynamodb`
 * - `stripe`
 *
 * See Vitest setup file `src/tests/setupTests.ts`
 */

describe("User Model", () => {
  describe("User.createOne()", () => {
    test("returns a valid User when called with valid args", async () => {
      for (const key in MOCK_USERS) {
        const result = await User.createOne({
          ...MOCK_USERS[key],
          ...(MOCK_USERS[key].login.type === "LOCAL"
            ? { password: "MockPassword@123" }
            : MOCK_USERS[key].login),
        });

        expect(result).toEqual({
          ...MOCK_USERS[key],
          id: expect.toSatisfyFn((value: string) => userModelHelpers.id.isValid(value)),
          sk: expect.toSatisfyFn((value: string) => userModelHelpers.sk.isValid(value)),
          login: {
            ...MOCK_USERS[key].login,
            ...(MOCK_USERS[key].login.type === "LOCAL" && {
              passwordHash: expect.stringMatching(/^\S{30,}$/),
            }),
          },
          profile: expect.objectContaining({
            displayName: MOCK_USERS[key].profile.displayName,
            businessName: expect.toBeOneOf([undefined, null, expect.any(String)]),
            givenName: expect.toBeOneOf([undefined, null, expect.any(String)]),
            familyName: expect.toBeOneOf([undefined, null, expect.any(String)]),
            photoUrl: expect.toBeOneOf([undefined, null, expect.any(String)]),
          }),
          stripeConnectAccount: {
            userID: expect.toSatisfyFn((value: string) => userModelHelpers.id.isValid(value)),
            sk: expect.toSatisfyFn((value: string) => scaModelHelpers.sk.isValid(value)),
            id: expect.toSatisfyFn((value) => isValidStripeID.connectAccount(value)),
            detailsSubmitted: expect.any(Boolean),
            chargesEnabled: expect.any(Boolean),
            payoutsEnabled: expect.any(Boolean),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      }
    });
  });

  describe("User.getItem()", () => {
    test("returns desired User when obtained via ID", async () => {
      const result = await User.getItem({ id: MOCK_USERS.USER_A.id });
      assert(!!result, `Failed to retrieve mock User with ID: "${MOCK_USERS.USER_A.id}".`);
      expect(result.id).toBe(MOCK_USERS.USER_A.id);
      expect(result).toEqual({
        ...MOCK_USERS.USER_A,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("User.batchGetItems()", () => {
    test("returns expected keys and values", async () => {
      const result = await User.batchGetItems(Object.values(MOCK_USERS).map(({ id }) => ({ id })));
      expect(result).toOnlyContain({
        id: expect.toSatisfyFn((value) => userModelHelpers.id.isValid(value)),
        sk: expect.toSatisfyFn((value) => userModelHelpers.sk.isValid(value)),
        handle: expect.toSatisfyFn((value: string) => isValid.handle(value)),
        email: expect.toSatisfyFn((value: string) => isValid.email(value)),
        phone: expect.toSatisfyFn((value: string) => isValid.phone(normalize.phone(value))),
        stripeCustomerID: expect.toSatisfyFn((value) => isValidStripeID.customer(value)),
        expoPushToken: expect.toBeOneOf([
          undefined,
          null,
          expect.stringMatching(/ExponentPushToken/),
        ]),
        login: expect.toBeOneOf([
          {
            type: "LOCAL",
            passwordHash: expect.stringMatching(/\S{30,}/i),
          },
          {
            type: "GOOGLE_OAUTH",
            googleID: expect.stringMatching(/\S{6,}/i),
            googleAccessToken: expect.stringMatching(/\S{6,}/i),
          },
        ]),
        profile: expect.objectContaining({
          displayName: expect.any(String),
          givenName: expect.toBeOneOf([undefined, null, expect.any(String)]),
          familyName: expect.toBeOneOf([undefined, null, expect.any(String)]),
          businessName: expect.toBeOneOf([undefined, null, expect.any(String)]),
          photoUrl: expect.toBeOneOf([undefined, null, expect.any(String)]),
        }),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("User.query()", () => {
    test("returns desired User when queried by email", async () => {
      const [result] = await User.query({
        where: { email: MOCK_USERS.USER_B.email },
        limit: 1,
      });
      expect(result).toEqual(MOCK_USERS.USER_B);
      expect(result.id).toBe(MOCK_USERS.USER_B.id);
    });
  });

  describe("User.updateItem()", () => {
    test("returns an updated User with expected keys and values", async () => {
      const NEW_DISPLAY_NAME = "Iam Updated-display-name";
      const updatedUser = await User.updateItem(MOCK_USERS.USER_A, {
        profile: { displayName: NEW_DISPLAY_NAME },
      });
      expect(updatedUser.profile.displayName).toBe(NEW_DISPLAY_NAME);
      expect(updatedUser).toEqual({
        ...MOCK_USERS.USER_A,
        profile: { ...MOCK_USERS.USER_A.profile, displayName: NEW_DISPLAY_NAME },
      });
    });
  });

  describe("User.deleteItem()", () => {
    test("returns a deleted User's ID", async () => {
      const result = await User.deleteItem({ id: MOCK_USERS.USER_C.id });
      expect(result?.id).toBe(MOCK_USERS.USER_C.id);
    });
  });
});
