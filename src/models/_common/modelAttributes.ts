import { isValidPhone, sanitizePhone } from "@nerdware/ts-string-helpers";
import { isString, isSafeInteger } from "@nerdware/ts-type-safety-utils";
import dayjs from "dayjs";
import { prettifyPhoneNumStr } from "@/utils/formatters/phone.js";
import { isValidTimestamp } from "@/utils/timestamps.js";
import type { ModelSchemaAttributeConfig } from "@nerdware/ddb-single-table";

export const COMMON_ATTRIBUTE_TYPES = {
  PHONE: {
    type: "string",
    validate: (value: unknown) => isString(value) && isValidPhone(value),
    transformValue: {
      /** If a phone-value is provided, all non-digit chars are rm'd */
      toDB: (value: unknown) => (isString(value) ? sanitizePhone(value) : null),
      /** Prettify phone num strings like `"8881234567"` into `"(888) 123-4567"` */
      fromDB: (value: unknown) => (isString(value) ? prettifyPhoneNumStr(value) : null),
    },
  },

  DATETIME: {
    type: "Date",
    validate: isValidTimestamp,
  },
} as const satisfies Record<string, Partial<ModelSchemaAttributeConfig>>;

export const COMMON_ATTRIBUTES = {
  /** `"createdAt"` and `"updatedAt"` timestamps */
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

  /** The DDB table's TTL attribute */
  TTL: {
    expiresAt: {
      // AWS requires TTL attributes to be Unix timestamps in non-leap seconds
      type: "number",
      // Unix timestamps in seconds will be 10 digits long until Nov 20 2286
      validate: (value: unknown) =>
        isSafeInteger(value) && `${value}`.length === 10 && dayjs(value).isValid(),
      transformValue: {
        toDB: (value: Date | number) => dayjs(value).unix(),
      },
    },
  },
} as const satisfies Record<string, Record<string, ModelSchemaAttributeConfig>>;
