import { createModelHelpers } from "@models/_common";
import { getUnixTimestampUUID } from "@utils/uuid";
import {
  WORK_ORDER_SK_PREFIX_STR as WO_SK_PREFIX,
  WORK_ORDER_ID_REGEX,
  WO_CHECKLIST_ITEM_ID_REGEX,
} from "./regex";

export const workOrderModelHelpers = createModelHelpers({
  id: {
    regex: WORK_ORDER_ID_REGEX,

    /** Returns a formatted WorkOrder "id" value (alias for "sk" attribute) */
    format: (createdByUserID: string, createdAt: Date) =>
      `${WO_SK_PREFIX}#${createdByUserID}#${getUnixTimestampUUID(createdAt)}`,

    formatWithExistingTimestampUUID: (
      createdByUserID: string,
      createdAtUnixTimestampUUID: string
    ) => `${WO_SK_PREFIX}#${createdByUserID}#${createdAtUnixTimestampUUID}`,
  },
  checklistItemID: {
    regex: WO_CHECKLIST_ITEM_ID_REGEX,

    format: (woID: string, createdAt?: Date) =>
      `${woID}#CHECKLIST_ITEM#${getUnixTimestampUUID(createdAt)}`,

    formatWithExistingTimestampUUID: (woID: string, createdAtUnixTimestampUUID: string) =>
      `${woID}#CHECKLIST_ITEM#${createdAtUnixTimestampUUID}`,
  },
});
