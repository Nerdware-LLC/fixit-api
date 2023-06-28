import jwt from "jsonwebtoken";
import { ENV } from "@server/env";

export const validateAndDecodeJWT = async (token: string): Promise<FixitApiJwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      JWT_PRIVATE_KEY,
      {
        ...SHARED_JWT_PARAMS,
        algorithms: ["HS256"],
        maxAge: "10h",
      },
      (err, decoded) => {
        if (err || !decoded) reject(new Error("Invalid token."));
        resolve(decoded as FixitApiJwtPayload);
      }
    );
  });
};

export const signAndEncodeJWT = (payload: FixitApiJwtPayload) => {
  return jwt.sign(payload, JWT_PRIVATE_KEY, {
    ...SHARED_JWT_PARAMS,
    algorithm: "HS256",
    expiresIn: "10h",
    subject: `${payload.id}`,
  });
};

const {
  CONFIG: { API_FULL_URL },
  SECURITY: { JWT_PRIVATE_KEY },
} = ENV;

/** JWT params used for both signing and verifying tokens. */
const SHARED_JWT_PARAMS = {
  audience: API_FULL_URL,
  issuer: "fixit",
};

export const INTERNAL_JWT_PAYLOAD_FIELDS: ReadonlyArray<keyof jwt.JwtPayload> = Object.freeze(
  ["iss", "sub", "aud", "exp", "nbf", "iat", "jti"] // prettier-ignore
);

/**
 * Fixit API JWT Token Payload
 * - Usage: provide a User object with an "id" property to use for the jwt "sub".
 *
 * Includes the following JwtPayload fields:
 * - `iss`: issuer
 * - `sub`: subject
 * - `aud`: audience
 * - `exp`: expiration time
 * - `nbf`: not before
 * - `iat`: issued at
 * - `jti`: jwt id
 */
export interface FixitApiJwtPayload extends jwt.JwtPayload {
  id: string;
}
