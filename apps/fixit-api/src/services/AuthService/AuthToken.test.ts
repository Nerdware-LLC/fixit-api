import { AuthToken } from "./AuthToken.js";

/** A valid AuthToken constructor arg. */
const MOCK_AUTH_TOKEN_USER_DATA = {
  id: "123",
  handle: "testuser",
  email: "testuser@example.com",
  phone: "1234567890",
  profile: {
    displayName: "Test User",
  },
  stripeCustomerID: "cus_123",
  stripeConnectAccount: {
    id: "acct_123",
    detailsSubmitted: true,
    chargesEnabled: true,
    payoutsEnabled: true,
  },
  subscription: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("AuthToken", () => {
  describe("new AuthToken()", () => {
    test("returns an instance of AuthToken when called with valid ctor args", () => {
      const authToken = new AuthToken(MOCK_AUTH_TOKEN_USER_DATA);
      expect(authToken).toBeInstanceOf(AuthToken);
    });

    test("throws an error when called with invalid ctor args", () => {
      expect(() => new AuthToken({} as any)).toThrow(/invalid/i);
    });
  });

  describe("authToken.toString()", () => {
    test("returns encoded token string when called", () => {
      const authToken = new AuthToken(MOCK_AUTH_TOKEN_USER_DATA);
      expect(authToken.toString()).toStrictEqual(expect.any(String));
    });
  });

  describe("AuthToken.validateAndDecode()", () => {
    test("returns decoded auth token payload when called with a valid token arg", async () => {
      const authToken = new AuthToken(MOCK_AUTH_TOKEN_USER_DATA);
      const result = await AuthToken.validateAndDecode(authToken.toString());
      expect(result).toStrictEqual({
        ...MOCK_AUTH_TOKEN_USER_DATA,
        createdAt: expect.toBeValidDate(),
        updatedAt: expect.toBeValidDate(),
      });
    });
  });

  describe("AuthToken.getValidatedRequestAuthTokenPayload()", () => {
    test("returns decoded auth token payload from a valid Authorization header", async () => {
      const authToken = new AuthToken(MOCK_AUTH_TOKEN_USER_DATA);
      const result = await AuthToken.getValidatedRequestAuthTokenPayload({
        get: vi.fn().mockReturnValue(`Bearer ${authToken.toString()}`),
      } as any);
      expect(result).toStrictEqual({
        ...MOCK_AUTH_TOKEN_USER_DATA,
        createdAt: expect.toBeValidDate(),
        updatedAt: expect.toBeValidDate(),
      });
    });
  });
});
