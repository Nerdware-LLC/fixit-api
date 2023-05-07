import { prettifyBizName } from "./businessName";
import { capitalizeFirstLetterOnly } from "./capitalizeFirstLetterOnly";
import { prettifyPhoneNum } from "./phone";

/**
 * A utility object with helper methods for "prettifying" strings.
 */
export const prettifyStr = {
  bizName: prettifyBizName,
  capFirstLetterOnly: capitalizeFirstLetterOnly,
  phone: prettifyPhoneNum,
};
