import bcrypt from "bcryptjs";

/**
 * #### passwordHasher
 * @method getHash  Get an encrypted hash of any string value.
 * @method validate Validate a plaintext string using an existing hash.
 */
export const passwordHasher = {
  getHash: async (plainText: string): Promise<string> => {
    // No await - let the promise resolve/reject to caller.
    return new Promise((resolve, reject) => {
      bcrypt.hash(plainText, 10, (err, hash) => {
        if (err) reject(`AUTH ERROR: ${err.message}`);
        resolve(hash);
      });
    });
  },
  validate: async (plainText: string, passwordHash: string): Promise<boolean> => {
    return await bcrypt.compare(plainText, passwordHash);
  },
};
