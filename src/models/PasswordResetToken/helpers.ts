import {
  createMapOfStringAttrHelpers,
  createHelpersForStrAttr,
  getCompoundAttrRegex,
  DELIMETER,
  type MapOfStringAttrHelpers,
} from "@/models/_common";

export const PW_RESET_TOKEN_SK_PREFIX_STR = "PW_RESET_TOKEN";

const pwResetTokenSKattrHelpers = createHelpersForStrAttr("sk", {
  /** Validation regex for `PasswordResetToken.sk` compound attribute. */
  regex: getCompoundAttrRegex([
    PW_RESET_TOKEN_SK_PREFIX_STR,
    /^[a-f0-9]{96}$/, // Regex pattern for 48-bit hex tokens (96 characters long)
  ]),
  /** PasswordResetToken "sk" value formatter. */
  format: (token: string) => `${PW_RESET_TOKEN_SK_PREFIX_STR}${DELIMETER}${token}`,
});

export const passwordResetTokenModelHelpers = createMapOfStringAttrHelpers({
  sk: pwResetTokenSKattrHelpers,
  data: pwResetTokenSKattrHelpers, // PRT `data` attribute is currently equal to the `sk` attribute
}) satisfies MapOfStringAttrHelpers;
