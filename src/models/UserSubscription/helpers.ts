import { isString } from "@nerdware/ts-type-safety-utils";
import dayjs from "dayjs";
import { pricesCache } from "@/lib/cache/pricesCache.js";
import { userModelHelpers } from "@/models/User/helpers.js";
import { createMapOfStringAttrHelpers, getCompoundAttrRegex, DELIMETER } from "@/models/_common";
import { UNIX_TIMESTAMP_REGEX } from "@/utils/timestamps.js";

export const SUB_SK_PREFIX_STR = "SUBSCRIPTION";

export const subModelHelpers = {
  ...createMapOfStringAttrHelpers({
    sk: {
      /** Validation regex for `UserSubscription.sk` values. */
      regex: getCompoundAttrRegex([
        SUB_SK_PREFIX_STR,
        userModelHelpers.id.regex,
        UNIX_TIMESTAMP_REGEX,
      ]),
      /** Returns a formatted UserSubscription "sk" value. */
      format: (userID: string, createdAt: Date) => {
        return `${SUB_SK_PREFIX_STR}${DELIMETER}${userID}${DELIMETER}${dayjs(createdAt).unix()}`;
      },
    },
  }),
  /** priceID validation uses cache data rather than regex patterns. */
  priceID: {
    isValid: (value?: unknown) => {
      return isString(value) && pricesCache.values().some(({ id: priceID }) => priceID === value);
    },
  },
};
