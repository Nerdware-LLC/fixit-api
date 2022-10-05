import moment from "moment";
import { normalizeInput, prettifyStr } from "@utils";

export const COMMON_ATTRIBUTE_TYPES = {
  // User phone, WorkOrder entryContactPhone
  PHONE: {
    type: "string",
    transformValue: {
      toDB: (value?: string) => (value ? normalizeInput.phone(value) : value), // Save only the digits
      fromDB: (value?: string) => (value ? prettifyStr.phone(value) : value) //   Convert "8881234567" to "(888) 123-4567"
    },
    validate: (value?: string) => !!value && /^\d{10,15}$/.test(value) // IRL global max phone length is 15
  },

  DATETIME: {
    type: "Date",
    validate: (value?: Date) => moment(value).isValid()
  }
} as const;

export const COMMON_ATTRIBUTES = {
  TIMESTAMPS: {
    createdAt: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME,
      required: true
    },
    updatedAt: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME,
      required: true,
      transformValue: {
        toDB: () => Math.floor(Date.now() / 1000) // <-- always update value
      }
    }
  }
} as const;
