import moment from "moment";
import { isType, normalizeInput, prettifyStr, US_PHONE_DIGITS_REGEX } from "@utils";

export const COMMON_ATTRIBUTE_TYPES = {
  PHONE: {
    type: "string",
    transformValue: {
      /** If a phone-value is provided, all non-digit chars are rm'd */
      toDB: (value: unknown) => (isType.string(value) ? normalizeInput.phone(value) : null),
      /** Prettify phone num strings like `"8881234567"` into `"(888) 123-4567"` */
      fromDB: (value: unknown) => (isType.string(value) ? prettifyStr.phone(value) : null),
    },
    validate: (value: unknown) => isType.string(value) && US_PHONE_DIGITS_REGEX.test(value),
  },

  DATETIME: {
    type: "Date",
    validate: (value: unknown) => !!value && moment(value).isValid(),
  },
} as const;

export const COMMON_ATTRIBUTES = {
  TIMESTAMPS: {
    createdAt: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME,
      default: () => new Date(),
      required: true,
    },
    updatedAt: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME,
      required: true,
      default: () => new Date(),
      transformValue: {
        /** This toDB ensures `updatedAt` is updated on every write op */
        toDB: () => new Date(),
      },
    },
  },
} as const;
