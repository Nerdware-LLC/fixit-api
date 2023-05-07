import jwt from "jsonwebtoken";
import { ENV } from "@server/env";

export const validateAndDecodeJWT = async (token: string): Promise<FixitApiJwtPayload> => {
  return new Promise((resolve, reject) => {
    // prettier-ignore
    jwt.verify(token, JWT_PRIVATE_KEY, JWT_VERIFICATION_PARAMS, (err: unknown, decoded) => {
      if (err) reject(new Error("Invalid token."));
      resolve(decoded as FixitApiJwtPayload);
    });
  });
};

export const signAndEncodeJWT = (payload: FixitApiJwtPayload) => {
  return jwt.sign(payload, JWT_PRIVATE_KEY, {
    ...JWT_SIGNING_PARAMS,
    subject: `${payload.id}`,
  });
};

const {
  CONFIG: { API_FULL_URL },
  SECURITY: { JWT_PRIVATE_KEY },
} = ENV;

const SHARED_JWT_PARAMS = {
  audience: API_FULL_URL,
  issuer: "fixit",
};

const JWT_SIGNING_PARAMS: jwt.SignOptions = {
  ...SHARED_JWT_PARAMS,
  algorithm: "HS256",
  expiresIn: "10h",
  // subject is payload-dependent
};

const JWT_VERIFICATION_PARAMS: jwt.VerifyOptions = {
  ...SHARED_JWT_PARAMS,
  algorithms: ["HS256"],
  maxAge: "10h",
};

/**
 * Fixit API JWT Token Payload
 * - Usage: provide a User object with an "id" property to use for the jwt "sub".
 */
export interface FixitApiJwtPayload {
  id: string;
  [tokenProperties: string]: any;
}
