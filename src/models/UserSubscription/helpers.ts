import { createModelHelpers } from "@models/_common";
import { getUnixTimestampUUID } from "@utils/uuid";
import {
  USER_SUB_SK_PREFIX_STR as SUB_SK_PREFIX,
  USER_SUB_SK_REGEX as SUB_SK_REGEX,
} from "./regex";

export const userSubscriptionModelHelpers = createModelHelpers({
  sk: {
    regex: SUB_SK_REGEX,

    /** Returns a formatted UserSubscription "sk" value */
    format: (userID: string, createdAt: Date) =>
      `${SUB_SK_PREFIX}#${userID}#${getUnixTimestampUUID(createdAt)}`,

    formatWithExistingTimestampUUID: (userID: string, createdAtUnixTimestampUUID: string) =>
      `${SUB_SK_PREFIX}#${userID}#${createdAtUnixTimestampUUID}`,
  },
});
