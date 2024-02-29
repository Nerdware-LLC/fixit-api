import jwt from "jsonwebtoken";
import { ENV } from "@/server/env/index.js";
import { signAndEncodeJWT, validateAndDecodeJWT } from "./jwt.js";

/** A valid JWT payload. */
const MOCK_JWT_PAYLOAD = { id: "123" };

describe("JWT", () => {
  describe("signAndEncodeJWT()", () => {
    test("returns a valid signed JWT when called with a valid payload arg", async () => {
      const token = signAndEncodeJWT(MOCK_JWT_PAYLOAD);
      const result = await validateAndDecodeJWT(token);
      expect(result).toStrictEqual(expect.objectContaining(MOCK_JWT_PAYLOAD));
    });
  });

  describe("validateAndDecodeJWT()", () => {
    test("returns a decoded payload when called with a valid token arg", async () => {
      const token = jwt.sign(MOCK_JWT_PAYLOAD, ENV.JWT.PRIVATE_KEY, {
        audience: ENV.CONFIG.API_FULL_URL,
        issuer: ENV.JWT.ISSUER,
        algorithm: ENV.JWT.ALGORITHM,
        expiresIn: "5m",
      });
      const result = await validateAndDecodeJWT(token);
      expect(result).toStrictEqual(expect.objectContaining(MOCK_JWT_PAYLOAD));
    });

    test("throws an error when called with an invalid token arg", async () => {
      await expect(validateAndDecodeJWT("invalid_token")).rejects.toThrow(
        "Signature verification failed"
      );
    });

    test(`throws "JsonWebTokenError" when called with a token with an invalid signature`, async () => {
      const token = jwt.sign(MOCK_JWT_PAYLOAD, "invalid_private_key", {
        audience: ENV.CONFIG.API_FULL_URL,
        issuer: ENV.JWT.ISSUER,
        algorithm: ENV.JWT.ALGORITHM,
        expiresIn: "5m",
      });
      await expect(validateAndDecodeJWT(token)).rejects.toThrow(/signature/i);
    });

    test(`throws "TokenExpiredError" when called with a token with an expired maxAge`, async () => {
      const token = jwt.sign(MOCK_JWT_PAYLOAD, ENV.JWT.PRIVATE_KEY, {
        audience: ENV.CONFIG.API_FULL_URL,
        issuer: ENV.JWT.ISSUER,
        algorithm: ENV.JWT.ALGORITHM,
        expiresIn: "0s",
      });
      await expect(validateAndDecodeJWT(token)).rejects.toThrow(/expired/i);
    });
  });
});
