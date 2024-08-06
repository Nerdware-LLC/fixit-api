import { userModelHelpers } from "@/models/User/helpers.js";
import { createMapOfStringAttrHelpers, getCompoundAttrRegex, DELIMETER } from "@/models/_common";
import { getRandomUUIDv4, UUID_REGEX } from "@/utils/uuid.js";

export const WO_SK_PREFIX_STR = "WO";
export const WO_CHECKLIST_ITEM_ID_INFIX_STR = "CHECKLIST_ITEM";

export const workOrderModelHelpers = createMapOfStringAttrHelpers({
  id: {
    regex: getCompoundAttrRegex([WO_SK_PREFIX_STR, userModelHelpers.id.regex, UUID_REGEX]),
    /** WorkOrder "id" value formatter. */
    format: (createdByUserID: string) => {
      return `${WO_SK_PREFIX_STR}${DELIMETER}${createdByUserID}${DELIMETER}${getRandomUUIDv4()}`;
    },
    /** Sanitizes a WorkOrder ID value. */
    sanitize: (str: string) => str.replace(/[^a-zA-Z0-9_@#-]/g, ""), // handle chars, UUID chars, and the delimeter
  },
  checklistItemID: {
    regex: getCompoundAttrRegex([
      // The WorkOrder:
      WO_SK_PREFIX_STR,
      userModelHelpers.id.regex,
      UUID_REGEX,
      // The checklist item:
      WO_CHECKLIST_ITEM_ID_INFIX_STR,
      UUID_REGEX,
    ]),
    /** WorkOrder checklist item "id" value formatter. */
    format: (woID: string) => {
      return `${woID}${DELIMETER}${WO_CHECKLIST_ITEM_ID_INFIX_STR}${DELIMETER}${getRandomUUIDv4()}`;
    },
  },
});
