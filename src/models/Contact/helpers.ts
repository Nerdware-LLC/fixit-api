import { userModelHelpers } from "@/models/User/helpers.js";
import { createMapOfStringAttrHelpers, getCompoundAttrRegex, DELIMETER } from "@/models/_common";

export const CONTACT_SK_PREFIX_STR = "CONTACT";

export const contactModelHelpers = createMapOfStringAttrHelpers({
  id: {
    /** Validation regex for Contact IDs. */
    regex: getCompoundAttrRegex([CONTACT_SK_PREFIX_STR, userModelHelpers.id.regex]),
    /** Sanitizes a Contact ID value. */
    sanitize: userModelHelpers.id.sanitize,
    /** Returns a formatted Contact "id" value. */
    format: (contactUserID: string) => `${CONTACT_SK_PREFIX_STR}${DELIMETER}${contactUserID}`,
  },
});
