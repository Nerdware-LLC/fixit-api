import { createModelHelpers } from "@/models/_common";
import { isDate } from "@/utils/typeSafety/isType";
import { getUnixTimestampUUID } from "@/utils/uuid";
import { INVOICE_SK_PREFIX_STR as SK_PREFIX, INVOICE_SK_REGEX } from "./regex";

export const invoiceModelHelpers = createModelHelpers({
  id: {
    regex: INVOICE_SK_REGEX,

    /**
     * Invoice "id" value formatter.
     *
     * @param {Date|string} createdAt - The Invoice's "createdAt" timestamp value represented as
     * either a Date object or unix timestamp UUID string. If provided as a Date object, it will
     * be converted to a Unix timestamp UUID string.
     *
     * @returns {string} A formatted Invoice "id" value (alias for "sk" attribute).
     */
    format: (createdByUserID: string, createdAt: Date | string) => {
      // prettier-ignore
      return `${SK_PREFIX}#${createdByUserID}#${isDate(createdAt) ? getUnixTimestampUUID(createdAt) : createdAt}`;
    },
  },
});
