import { createModelHelpers } from "@models/_common";
import { getUnixTimestampUUID } from "@utils";
import {
  USER_ID_PREFIX_STR as ID_PREFIX,
  USER_ID_REGEX,
  USER_SK_PREFIX_STR as SK_PREFIX,
  USER_SK_REGEX,
} from "./regex";

export const userModelHelpers = createModelHelpers({
  id: {
    regex: USER_ID_REGEX,

    /** Returns a formatted User "id" value (alias for "pk" attribute) */
    format: (userCreatedAt: Date) => `${ID_PREFIX}#${getUnixTimestampUUID(userCreatedAt)}`,

    formatWithExistingTimestampUUID: (createdAtUnixTimestampUUID: string) =>
      `${ID_PREFIX}#${createdAtUnixTimestampUUID}`,
  },
  sk: {
    regex: USER_SK_REGEX,

    /** Returns a formatted User "sk" value */
    format: (userID: string) => `${SK_PREFIX}#${userID}`,
  },
});
