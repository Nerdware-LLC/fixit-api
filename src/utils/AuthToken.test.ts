import dayjs from "dayjs";
import { AuthToken } from "./AuthToken";

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
      expect(() => new AuthToken({} as any)).toThrow();
    });
  });

  describe("authToken.toString()", () => {
    test("returns encoded token string when called", () => {
      const authToken = new AuthToken(MOCK_AUTH_TOKEN_USER_DATA);
      expect(authToken.toString()).toEqual(expect.any(String));
    });
  });

  describe("AuthToken.validateAndDecodeAuthToken()", () => {
    test("returns decoded auth token payload when called with a valid token arg", async () => {
      const authToken = new AuthToken(MOCK_AUTH_TOKEN_USER_DATA);
      const result = await AuthToken.validateAndDecodeAuthToken(authToken.toString());
      expect(result).toEqual({
        ...MOCK_AUTH_TOKEN_USER_DATA,
        createdAt: expect.toSatisfyFn((value) => dayjs(value).isValid()),
        updatedAt: expect.toSatisfyFn((value) => dayjs(value).isValid()),
      });
    });
  });

  describe("AuthToken.getValidatedRequestAuthTokenPayload()", () => {
    test("returns decoded auth token payload from a valid Authorization header", async () => {
      const authToken = new AuthToken(MOCK_AUTH_TOKEN_USER_DATA);
      const result = await AuthToken.getValidatedRequestAuthTokenPayload({
        get: vi.fn().mockReturnValue(`Bearer ${authToken.toString()}`),
      } as any);
      expect(result).toEqual({
        ...MOCK_AUTH_TOKEN_USER_DATA,
        createdAt: expect.toSatisfyFn((value) => dayjs(value).isValid()),
        updatedAt: expect.toSatisfyFn((value) => dayjs(value).isValid()),
      });
    });
  });

  describe("AuthToken.stripInternalJwtPayloadFields()", () => {
    test("returns the payload with internal JWT payload fields stripped", () => {
      const result = AuthToken.stripInternalJwtPayloadFields({
        ...MOCK_AUTH_TOKEN_USER_DATA,
        aud: "test",
      });
      expect(result).toEqual(MOCK_AUTH_TOKEN_USER_DATA);
      expect(result).not.toHaveProperty("aud");
    });
  });
});
