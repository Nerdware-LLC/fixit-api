import { createModelHelpers } from "@/models/_common";
import { getUnixTimestampUUID } from "@/utils/uuid";
import { INVOICE_SK_PREFIX_STR as SK_PREFIX, INVOICE_SK_REGEX } from "./regex";

export const invoiceModelHelpers = createModelHelpers({
  id: {
    regex: INVOICE_SK_REGEX,

    /** Returns a formatted Invoice "id" value (alias for "sk" attribute) */
    format: (createdByUserID: string, createdAt: Date) =>
      `${SK_PREFIX}#${createdByUserID}#${getUnixTimestampUUID(createdAt)}`,

    formatWithExistingTimestampUUID: (
      createdByUserID: string,
      createdAtUnixTimestampUUID: string
    ) => `${SK_PREFIX}#${createdByUserID}#${createdAtUnixTimestampUUID}`,
  },
});
