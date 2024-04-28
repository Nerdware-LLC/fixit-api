import { createModelHelpers } from "@/models/_common/modelHelpers.js";
import { PW_RESET_TOKEN_SK_REGEX, PW_RESET_TOKEN_SK_PREFIX_STR as SK_PREFIX } from "./regex.js";

export const passwordResetTokenModelHelpers = createModelHelpers({
  sk: {
    regex: PW_RESET_TOKEN_SK_REGEX,

    /**
     * PasswordResetToken "sk" value formatter.
     *
     * @param {string} token - The hex-encoded token value.
     * @returns {string} A formatted PasswordResetToken "sk" attribute value.
     */
    format: (token: string) => `${SK_PREFIX}#${token}`,
  },
});
