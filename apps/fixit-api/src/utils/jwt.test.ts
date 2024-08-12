import jwt, { type Algorithm } from "jsonwebtoken";
import { ENV } from "@/server/env";
import { JWT } from "./jwt.js";

const MOCK_JWT_PAYLOAD = { id: "123" };
const algorithm = ENV.JWT.ALGORITHM as Algorithm;

describe("JWT", () => {
  describe("JWT.signAndEncode()", () => {
    test("returns a valid signed JWT when called with a valid payload arg", async () => {
      const token = JWT.signAndEncode(MOCK_JWT_PAYLOAD);
      const result = await JWT.validateAndDecode(token);
      expect(result).toStrictEqual(expect.objectContaining(MOCK_JWT_PAYLOAD));
    });
  });

  describe("JWT.validateAndDecode()", () => {
    test("returns a decoded payload when called with a valid token arg", async () => {
      const token = jwt.sign(MOCK_JWT_PAYLOAD, ENV.JWT.PRIVATE_KEY, {
        audience: ENV.CONFIG.API_BASE_URL,
        issuer: ENV.JWT.ISSUER,
        algorithm,
        expiresIn: "5m",
      });
      const result = await JWT.validateAndDecode(token);
      expect(result).toStrictEqual(expect.objectContaining(MOCK_JWT_PAYLOAD));
    });

    test("throws an error when called with an invalid token arg", async () => {
      await expect(JWT.validateAndDecode("invalid_token")).rejects.toThrow(
        "Signature verification failed"
      );
    });

    test(`throws "JsonWebTokenError" when called with a token with an invalid signature`, async () => {
      const token = jwt.sign(MOCK_JWT_PAYLOAD, "invalid_private_key", {
        audience: ENV.CONFIG.API_BASE_URL,
        issuer: ENV.JWT.ISSUER,
        algorithm,
        expiresIn: "5m",
      });
      await expect(JWT.validateAndDecode(token)).rejects.toThrow(/signature/i);
    });

    test(`throws "TokenExpiredError" when called with a token with an expired maxAge`, async () => {
      const token = jwt.sign(MOCK_JWT_PAYLOAD, ENV.JWT.PRIVATE_KEY, {
        audience: ENV.CONFIG.API_BASE_URL,
        issuer: ENV.JWT.ISSUER,
        algorithm,
        expiresIn: "0s",
      });
      await expect(JWT.validateAndDecode(token)).rejects.toThrow(/expired/i);
    });
  });
});
