import { isValidHandle } from "@nerdware/ts-string-helpers";
import { createMapOfStringAttrHelpers, getCompoundAttrRegex, DELIMETER } from "@/models/_common";

export const USER_ID_PREFIX_STR = "USER";
export const USER_SK_PREFIX_STR = `${DELIMETER}DATA`;

export const userModelHelpers = createMapOfStringAttrHelpers({
  id: {
    /** Validation regex for User IDs. */
    regex: getCompoundAttrRegex([USER_ID_PREFIX_STR, isValidHandle._regex]),
    /** User "id" value formatter. */
    format: (handle: string) => `${USER_ID_PREFIX_STR}${DELIMETER}${handle}`,
    /** Sanitizes a User ID value (permits `handle` chars and the {@link DELIMETER} char). */
    sanitize: (str: string) => str.replace(/[^a-zA-Z0-9_@#]/g, ""),
  },
  sk: {
    /** Validation regex for User `sk` attribute values. */
    regex: getCompoundAttrRegex([USER_SK_PREFIX_STR, USER_ID_PREFIX_STR, isValidHandle._regex]),
    /** User "sk" value formatter. */
    format: (userID: string) => `${USER_SK_PREFIX_STR}${DELIMETER}${userID}`,
  },
});

/**
 * User Model helper fn which extracts a User's `handle` from their `id`.
 */
export const extractHandleFromUserID = (userID: string): string => {
  return userID.substring(USER_ID_PREFIX_STR.length + 1);
};
