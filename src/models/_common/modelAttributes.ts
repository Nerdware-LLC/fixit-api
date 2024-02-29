import { isValidPhone } from "@nerdware/ts-string-helpers";
import { isString } from "@nerdware/ts-type-safety-utils";
import dayjs from "dayjs";
import { fmt } from "@/utils/formatters/index.js";
import { normalize } from "@/utils/normalize.js";
import type { ModelSchemaAttributeConfig } from "@nerdware/ddb-single-table";

export const COMMON_ATTRIBUTE_TYPES = {
  PHONE: {
    type: "string",
    validate: (value: unknown) => isString(value) && isValidPhone(value),
    transformValue: {
      /** If a phone-value is provided, all non-digit chars are rm'd */
      toDB: (value: unknown) => (isString(value) ? normalize.phone(value) : null),
      /** Prettify phone num strings like `"8881234567"` into `"(888) 123-4567"` */
      fromDB: (value: unknown) => (isString(value) ? fmt.prettifyPhoneNum(value) : null),
    },
  },

  DATETIME: {
    type: "Date",
    validate: (value: unknown) => !!value && dayjs(value as Parameters<typeof dayjs>[0]).isValid(),
  },
} as const satisfies Record<string, Partial<ModelSchemaAttributeConfig>>;

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
  } satisfies Record<string, ModelSchemaAttributeConfig>,
} as const;
