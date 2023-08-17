import { createModelHelpers } from "@models/_common";
import {
  STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR as SCA_SK_PREFIX,
  STRIPE_CONNECT_ACCOUNT_SK_REGEX as SCA_SK_REGEX,
} from "./regex";

export const userStripeConnectAccountModelHelpers = createModelHelpers({
  sk: {
    regex: SCA_SK_REGEX,
    /** Returns a formatted UserStripeConnectAccount "sk" value */
    format: (userID: string) => `${SCA_SK_PREFIX}#${userID}`,
  },
});
