import { isDate } from "@nerdware/ts-type-safety-utils";
import { createModelHelpers } from "@/models/_common/modelHelpers.js";
import { getUnixTimestampUUID } from "@/utils/uuid.js";
import {
  USER_ID_PREFIX_STR as ID_PREFIX,
  USER_ID_REGEX,
  USER_SK_PREFIX_STR as SK_PREFIX,
  USER_SK_REGEX,
} from "./regex.js";

export const userModelHelpers = createModelHelpers({
  id: {
    regex: USER_ID_REGEX,

    /**
     * User "id" value formatter.
     *
     * @param {Date|string} createdAt - The User's "createdAt" timestamp value represented as
     * either a Date object or unix timestamp UUID string. If provided as a Date object, it will
     * be converted to a Unix timestamp UUID string.
     *
     * @returns {string} A formatted User "id" value (alias for "pk" attribute).
     */
    format: (createdAt: Date | string) => {
      return `${ID_PREFIX}#${isDate(createdAt) ? getUnixTimestampUUID(createdAt) : createdAt}`;
    },
  },
  sk: {
    regex: USER_SK_REGEX,

    /**
     * User "sk" value formatter.
     *
     * @param {string} userID - The User's "id".
     * @returns {string} A formatted User "sk" attribute value.
     */
    format: (userID: string) => `${SK_PREFIX}#${userID}`,
  },
});
