import { hash, compare } from "bcrypt";
import { ENV } from "@/server/env";

/**
 * ### passwordHasher
 * This util is used to hash and validate passwords.
 */
export const passwordHasher = {
  /** Get an encrypted hash of any string value. */
  getHash: async (plainText: string) => {
    return hash(plainText, ENV.BCRYPT_SALT_ROUNDS);
  },
  /** Validate a plaintext string using an existing hash. */
  validate: async (plainText: string, passwordHash: string) => {
    return compare(plainText, passwordHash);
  },
};
