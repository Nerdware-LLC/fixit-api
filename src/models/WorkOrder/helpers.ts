import { isDate, isString } from "@nerdware/ts-type-safety-utils";
import { createModelHelpers } from "@/models/_common";
import { getUnixTimestampUUID } from "@/utils/uuid";
import {
  WORK_ORDER_SK_PREFIX_STR as WO_SK_PREFIX,
  WORK_ORDER_ID_REGEX,
  WO_CHECKLIST_ITEM_ID_REGEX,
} from "./regex";

export const workOrderModelHelpers = createModelHelpers({
  id: {
    regex: WORK_ORDER_ID_REGEX,

    /** Returns a formatted WorkOrder "id" value (alias for "sk" attribute) */

    /**
     * WorkOrder "id" value formatter (alias for "sk" attribute).
     *
     * @param {Date|string} createdAt - The WorkOrder's "createdAt" timestamp value represented as
     * either a Date object or unix timestamp UUID string. If provided as a Date object, it will
     * be converted to a Unix timestamp UUID string.
     *
     * @returns {string} A formatted WorkOrder "id" value (alias for "sk" attribute).
     */
    format: (createdByUserID: string, createdAt: Date | string) => {
      // prettier-ignore
      return `${WO_SK_PREFIX}#${createdByUserID}#${isDate(createdAt) ? getUnixTimestampUUID(createdAt) : createdAt}`;
    },
  },
  checklistItemID: {
    regex: WO_CHECKLIST_ITEM_ID_REGEX,

    /**
     * WorkOrder checklist item "id" value formatter.
     *
     * @param {Date|string} createdAt - The WorkOrder checklist item's "createdAt" timestamp value
     * represented as either a Date object or unix timestamp UUID string. If not provided, the
     * current time will be used (`new Date()`). If provided as a Date object, it will be converted
     * to a Unix timestamp UUID string.
     *
     * @returns {string} A formatted WorkOrder checklist item "id" value.
     */
    format: (woID: string, createdAt?: Date | string) => {
      // prettier-ignore
      return `${woID}#CHECKLIST_ITEM#${isString(createdAt) ? createdAt : getUnixTimestampUUID(createdAt)}`;
    },
  },
});
