import jwt from "jsonwebtoken";
import { ENV } from "@/server/env";
import { AuthError } from "@/utils/httpErrors.js";

/**
 * Validates and decodes a JSON Web Token (JWT) using the provided private key
 * and algorithm. It checks if the token is valid based on the shared parameters
 * and returns the decoded payload if successful.
 *
 * @param token - The JWT to be validated and decoded.
 * @returns A Promise that resolves to a 'FixitApiJwtPayload' object representing the decoded JWT payload.
 * @throws An error if the token is invalid.
 */
export const validateAndDecodeJWT = async <
  DecodedPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  token: string
): Promise<DecodedPayload & jwt.JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      ENV.JWT.PRIVATE_KEY,
      {
        audience: ENV.CONFIG.API_BASE_URL,
        issuer: ENV.JWT.ISSUER,
        algorithms: [ENV.JWT.ALGORITHM],
        maxAge: ENV.JWT.EXPIRES_IN,
      },
      (err, decoded) => {
        if (err || !decoded) {
          reject(
            new AuthError(
              err?.name === "TokenExpiredError"
                ? "Your login credentials have expired — please sign in again."
                : err?.name === "JsonWebTokenError"
                  ? "Signature verification failed"
                  : "Invalid auth token"
            )
          );
        }
        resolve(decoded as DecodedPayload);
      }
    );
  });
};

/**
 * Signs and encodes a JSON Web Token (JWT) using the provided payload and env vars.
 *
 * @param payload - The payload data for the JWT; if `payload.id` is provided, it will be used as the JWT subject.
 * @returns The signed and encoded JWT string.
 */
export const signAndEncodeJWT = (payload: jwt.JwtPayload & { id?: string }) => {
  return jwt.sign(payload, ENV.JWT.PRIVATE_KEY, {
    audience: ENV.CONFIG.API_BASE_URL,
    issuer: ENV.JWT.ISSUER,
    algorithm: ENV.JWT.ALGORITHM,
    expiresIn: ENV.JWT.EXPIRES_IN,
    subject: payload.id,
  });
};
