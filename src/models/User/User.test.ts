import { isValidStripeID } from "@/lib/stripe";
import { userStripeConnectAccountModelHelpers as scaModelHelpers } from "@/models/UserStripeConnectAccount/helpers";
import { MOCK_USERS, UNALIASED_MOCK_USERS } from "@/tests/staticMockItems/users";
import { User } from "./User";
import { userModelHelpers } from "./helpers";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

describe("User Model", () => {
  describe("User.createOne()", () => {
    test("returns a valid User when called with valid arguments", async () => {
      // Arrange mock Users
      for (const key in MOCK_USERS) {
        // Get input for User.createOne() method
        const mockUser = MOCK_USERS[key as keyof typeof MOCK_USERS];
        const input = {
          ...mockUser,
          ...(mockUser.login.type === "LOCAL" ? { password: "MockPassword@123" } : mockUser.login),
        };

        // Act on the User.createOne() method
        const result = await User.createOne(input);

        // Assert the result
        expect(result).toStrictEqual({
          id: expect.toSatisfyFn((value) => userModelHelpers.id.isValid(value)),
          sk: expect.toSatisfyFn((value) => userModelHelpers.sk.isValid(value)),
          handle: mockUser.handle,
          email: mockUser.email,
          phone: mockUser.phone,
          stripeCustomerID: mockUser.stripeCustomerID,
          ...(mockUser.expoPushToken && { expoPushToken: mockUser.expoPushToken }),
          profile: {
            ...mockUser.profile,
            givenName: expect.toBeOneOf([undefined, null, expect.any(String)]),
            familyName: expect.toBeOneOf([undefined, null, expect.any(String)]),
            businessName: expect.toBeOneOf([undefined, null, expect.any(String)]),
            photoUrl: expect.toBeOneOf([undefined, null, expect.any(String)]),
          },
          login: {
            ...mockUser.login,
            ...(mockUser.login.type === "LOCAL" && { passwordHash: expect.any(String) }),
          },
          stripeConnectAccount: {
            userID: expect.toSatisfyFn((value) => userModelHelpers.id.isValid(value)),
            id: expect.toSatisfyFn((value) => isValidStripeID.connectAccount(value)),
            sk: expect.toSatisfyFn((value) => scaModelHelpers.sk.isValid(value)),
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
    test(`returns desired User when obtained by "id"`, async () => {
      // Arrange User.ddbClient.getItem() to return an unaliased mock User
      vi.spyOn(User.ddbClient, "getItem").mockResolvedValueOnce({
        $metadata: {},
        Item: UNALIASED_MOCK_USERS.USER_A,
      });

      // Act on the User Model's getItem method
      const result = await User.getItem({ id: USER_A.id });

      // Assert the result
      expect(result).toStrictEqual(USER_A);
    });
  });

  describe("User.batchGetItems()", () => {
    test("returns expected keys and values", async () => {
      // Arrange User.ddbClient.batchGetItems() to return unaliased mock Users
      vi.spyOn(User.ddbClient, "batchGetItems").mockResolvedValueOnce({
        $metadata: {},
        Responses: {
          [User.tableName]: Object.values(UNALIASED_MOCK_USERS),
        },
      });

      // Act on the User Model's batchGetItems method
      const result = await User.batchGetItems(Object.values(MOCK_USERS).map(({ id }) => ({ id })));

      // Assert the result
      expect(result).toStrictEqual(Object.values(MOCK_USERS));
    });
  });

  describe.todo("User.query()", () => {
    test("returns desired User when queried by email", async () => {
      // Arrange spy on User.ddbClient.query() method
      vi.spyOn(User.ddbClient, "query").mockResolvedValueOnce({
        $metadata: {},
        Items: [UNALIASED_MOCK_USERS.USER_B],
      });

      const result = await User.query({
        where: { email: USER_B.email },
        limit: 1,
      });

      expect(result).toStrictEqual([USER_B]);
    });
  });

  describe("User.updateItem()", () => {
    test("returns an updated User with expected keys and values", async () => {
      // Arrange value to update
      const NEW_DISPLAY_NAME = "Iam Updated-display-name";

      // Arrange spy on User.ddbClient.updateItem() method
      const updateItemSpy = vi.spyOn(User.ddbClient, "updateItem").mockResolvedValueOnce({
        $metadata: {},
        Attributes: {
          ...UNALIASED_MOCK_USERS.USER_C,
          profile: {
            ...UNALIASED_MOCK_USERS.USER_C.profile,
            displayName: NEW_DISPLAY_NAME,
          },
        },
      });

      // Act on the User Model's updateItem method
      const result = await User.updateItem(
        { id: MOCK_USERS.USER_C.id, sk: MOCK_USERS.USER_C.sk },
        {
          update: {
            profile: { displayName: NEW_DISPLAY_NAME },
          },
        }
      );

      // Assert the result
      expect(result).toStrictEqual({
        ...MOCK_USERS.USER_C,
        profile: { ...MOCK_USERS.USER_C.profile, displayName: NEW_DISPLAY_NAME },
      });

      // Assert updateItemSpy was called with expected arguments
      expect(updateItemSpy).toHaveBeenCalledWith({
        TableName: User.tableName,
        Key: { pk: USER_C.id, sk: USER_C.sk },
        UpdateExpression: "SET #profile = :profile, #updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#profile": "profile", "#updatedAt": "updatedAt" },
        ExpressionAttributeValues: {
          ":profile": { displayName: "Iam Updated-display-name" },
          ":updatedAt": expect.any(Number),
        },
        ReturnValues: "ALL_NEW",
      });
    });
  });

  describe("User.deleteItem()", () => {
    test("returns a deleted User", async () => {
      // Arrange spy on User.ddbClient.deleteItem() method
      vi.spyOn(User.ddbClient, "deleteItem").mockResolvedValueOnce({
        $metadata: {},
        Attributes: UNALIASED_MOCK_USERS.USER_C,
      });

      // Act on the User Model's deleteItem method
      const result = await User.deleteItem({ id: USER_C.id });

      // Assert the result
      expect(result).toStrictEqual(USER_C);
    });
  });
});
