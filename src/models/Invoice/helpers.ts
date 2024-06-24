import { sanitizeID } from "@nerdware/ts-string-helpers";
import { isSafeInteger } from "@nerdware/ts-type-safety-utils";
import { userModelHelpers } from "@/models/User/helpers.js";
import { createMapOfStringAttrHelpers, getCompoundAttrRegex, DELIMETER } from "@/models/_common";
import { getRandomUUIDv4, UUID_REGEX } from "@/utils/uuid.js";

export const INVOICE_SK_PREFIX_STR = "INV";

export const invoiceModelHelpers = {
  ...createMapOfStringAttrHelpers({
    id: {
      /** Invoice ID validation regex. */
      regex: getCompoundAttrRegex([INVOICE_SK_PREFIX_STR, userModelHelpers.id.regex, UUID_REGEX]),
      /** Sanitizes an Invoice ID value. */
      sanitize: sanitizeID,
      /** Invoice "id" value formatter. */
      format: (createdByUserID: string) => {
        return `${INVOICE_SK_PREFIX_STR}${DELIMETER}${createdByUserID}${DELIMETER}${getRandomUUIDv4()}`;
      },
    },
  }),
  /** `Invoice.amount` attribute helpers */
  amount: {
    isValid: (value?: unknown) => isSafeInteger(value) && value > 0,
  },
};
