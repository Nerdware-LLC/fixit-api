import { hash, compare } from "bcrypt";
import { ENV } from "@/server/env/index.js";

/**
 * #### passwordHasher
 * @method getHash  Get an encrypted hash of any string value.
 * @method validate Validate a plaintext string using an existing hash.
 */
export const passwordHasher = {
  getHash: async (plainText: string) => {
    return hash(plainText, ENV.BCRYPT_SALT_ROUNDS);
  },
  validate: async (plainText: string, passwordHash: string) => {
    return compare(plainText, passwordHash);
  },
};
