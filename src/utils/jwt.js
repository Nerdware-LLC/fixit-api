import jwt from "jsonwebtoken";
import { ENV } from "@server/env";

export const validateAndDecodeJWT = async (token) => {
  return new Promise((resolve, reject) => {
    // prettier-ignore
    jwt.verify(token, JWT_PRIVATE_KEY, JWT_VERIFICATION_PARAMS, (err, decoded) => {
      if (err) reject(new Error("Invalid token."));
      resolve(decoded);
    });
  });
};

export const signAndEncodeJWT = (payload) => {
  return jwt.sign(payload, JWT_PRIVATE_KEY, {
    ...JWT_SIGNING_PARAMS,
    subject: `${payload.id}`
  });
};

const {
  IS_PROD,
  CONFIG: { SELF_URI, PORT },
  SECURITY: { JWT_PRIVATE_KEY }
} = ENV;

const SHARED_JWT_PARAMS = {
  audience: `http${IS_PROD ? "s" : ""}://${SELF_URI}:${PORT}`,
  issuer: "fixit"
};

const JWT_SIGNING_PARAMS = {
  ...SHARED_JWT_PARAMS,
  algorithm: "HS256",
  expiresIn: "10h"
  // subject is payload-dependent
};

const JWT_VERIFICATION_PARAMS = {
  ...SHARED_JWT_PARAMS,
  algorithms: ["HS256"],
  maxAge: "10h"
};
