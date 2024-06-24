import { sanitizeID, isValidHandle } from "@nerdware/ts-string-helpers";
import { createMapOfStringAttrHelpers, getCompoundAttrRegex, DELIMETER } from "@/models/_common";
import { getUUIDv5, UUID_REGEX } from "@/utils/uuid.js";

export const USER_ID_PREFIX_STR = "USER";
export const USER_SK_PREFIX_STR = `${DELIMETER}DATA`;

export const userModelHelpers = createMapOfStringAttrHelpers({
  id: {
    /** Validation regex for User IDs. */
    regex: getCompoundAttrRegex([USER_ID_PREFIX_STR, UUID_REGEX]),
    /** User "id" value formatter (uses {@link getUUIDv5}). */
    format: (handle: string) => {
      const handleUUID = isValidHandle(handle) ? getUUIDv5(handle) : handle;
      return `${USER_ID_PREFIX_STR}${DELIMETER}${handleUUID}`;
    },
    /** Sanitizes a User ID value. */
    sanitize: sanitizeID,
  },
  sk: {
    /** Validation regex for User `sk` attribute values. */
    regex: getCompoundAttrRegex([USER_SK_PREFIX_STR, USER_ID_PREFIX_STR, UUID_REGEX]),
    /** User "sk" value formatter. */
    format: (userID: string) => `${USER_SK_PREFIX_STR}${DELIMETER}${userID}`,
  },
});
