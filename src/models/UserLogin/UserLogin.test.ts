import { UserLogin } from "./UserLogin.js";

describe("UserLogin", () => {
  describe("UserLogin.createLogin()", () => {
    test("returns a LOCAL UserLogin when called with a password", async () => {
      const password = "MockPassword@123";
      const result = await UserLogin.createLogin({ password });
      expect(result.type).toBe("LOCAL");
      expect(result.passwordHash).toBeTypeOf("string");
    });

    test("returns a GOOGLE_OAUTH UserLogin when called with a Google ID and access token", async () => {
      const googleID = "gid_123";
      const googleAccessToken = "gat_123";
      const result = await UserLogin.createLogin({ googleID, googleAccessToken });
      expect(result.type).toBe("GOOGLE_OAUTH");
      expect(result.googleID).toBe(googleID);
      expect(result.googleAccessToken).toBe(googleAccessToken);
    });

    test("throws an error when called without any params", async () => {
      await expect(UserLogin.createLogin({} as any)).rejects.toThrow("Invalid login credentials");
    });

    test(`throws an error when called with a "password" arg less than 6 characters long`, async () => {
      await expect(UserLogin.createLogin({ password: "12345" })).rejects.toThrow(
        "The provided password does not meet the required criteria"
      );
    });

    test(`throws an error when called with an invalid "googleID" arg`, async () => {
      const googleID = "bad";
      const googleAccessToken = "gat_123";
      await expect(UserLogin.createLogin({ googleID, googleAccessToken })).rejects.toThrow(
        "Invalid Google ID"
      );
    });

    test(`throws an error when called with an invalid "googleAccessToken" arg`, async () => {
      const googleID = "gid_123";
      const googleAccessToken = "bad";
      await expect(UserLogin.createLogin({ googleID, googleAccessToken })).rejects.toThrow(
        "Invalid Google access token"
      );
    });
  });
});
