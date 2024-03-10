import dayjs from "dayjs";
import { createModelHelpers } from "@/models/_common/modelHelpers.js";
import {
  USER_SUB_SK_PREFIX_STR as SUB_SK_PREFIX,
  USER_SUB_SK_REGEX as SUB_SK_REGEX,
} from "./regex.js";

export const userSubscriptionModelHelpers = createModelHelpers({
  sk: {
    regex: SUB_SK_REGEX,

    /** Returns a formatted UserSubscription "sk" value */
    format: (userID: string, createdAt: Date) => {
      return `${SUB_SK_PREFIX}#${userID}#${dayjs(createdAt).unix()}`;
    },
  },
});
