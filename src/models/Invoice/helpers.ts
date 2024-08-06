import { isSafeInteger } from "@nerdware/ts-type-safety-utils";
import { userModelHelpers } from "@/models/User/helpers.js";
import { createHelpersForStrAttr, getCompoundAttrRegex, DELIMETER } from "@/models/_common";
import { getRandomUUIDv4, UUID_REGEX } from "@/utils/uuid.js";

export const INVOICE_SK_PREFIX_STR = "INV";

export const invoiceModelHelpers = {
  id: createHelpersForStrAttr("id", {
    /** Invoice ID validation regex. */
    regex: getCompoundAttrRegex([INVOICE_SK_PREFIX_STR, userModelHelpers.id.regex, UUID_REGEX]),
    /** Sanitizes an Invoice ID value. */
    sanitize: (str: string) => str.replace(/[^a-zA-Z0-9_@#-]/g, ""), // handle chars, UUID chars, and the delimeter
    /** Invoice "id" value formatter. */
    format: (createdByUserID: string) => {
      return `${INVOICE_SK_PREFIX_STR}${DELIMETER}${createdByUserID}${DELIMETER}${getRandomUUIDv4()}`;
    },
  }),
  amount: {
    isValid: (value?: unknown) => isSafeInteger(value) && value > 0,
  },
};
