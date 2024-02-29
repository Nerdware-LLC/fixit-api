import { createModelHelpers } from "@/models/_common/modelHelpers.js";
import { CONTACT_SK_PREFIX_STR as SK_PREFIX, CONTACT_SK_REGEX } from "./regex.js";

export const contactModelHelpers = createModelHelpers({
  id: {
    regex: CONTACT_SK_REGEX,
    /** Returns a formatted Contact "id" value (alias for "sk" attribute) */
    format: (contactUserID: string) => `${SK_PREFIX}#${contactUserID}`,
  },
});
