import moment from "moment";
import { normalizeInput, prettifyStr } from "@utils";

export const COMMON_MODEL_ATTRIBUTES = {
  // User phone, WorkOrder entryContactPhone
  PHONE: {
    type: "string",
    transformValue: {
      toDB: normalizeInput.phone, // Save only the digits
      fromDB: prettifyStr.phone //   Convert "8881234567" to "(888) 123-4567"
    },
    validate: (value: string) => !!value && /^\d{10,15}$/.test(value) // IRL global max phone length is 15
  },

  DATETIME: {
    type: "Date",
    validate: (value?: Date) => moment(value).isValid()
  }
} as const;
