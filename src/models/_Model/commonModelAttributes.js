import moment from "moment";
import { normalizeInput, prettifyStr } from "@utils";

/* Dynamoose schema configs for common Item Attributes which are needed by
multiple Models go here. General purpose regex patterns (e.g., for email
addresses) reside in src/utils/regex. Model-specific patterns which are not
shared between multiple Models reside in their respective Model dirs.   */

export const COMMON_MODEL_ATTRIBUTES = {
  // User phone, WorkOrder entryContactPhone
  PHONE: {
    type: String,
    set: normalizeInput.phone, // Save only the digits
    get: prettifyStr.phone, //    Convert "8881234567" to "(888) 123-4567"
    validate: /^\d{10,15}$/ //    IRL global max phone length is 15
  },

  DATETIME: {
    type: Date,
    validate: (value) => moment(value).isValid()
  }
};
