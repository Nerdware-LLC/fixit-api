import { USER_ID_REGEX_STR } from "@models/User";
import { UNIX_TIMESTAMP_REGEX_STR } from "@utils/regex";

export const USER_SUBSCRIPTION_SK_REGEX = new RegExp(
  `^SUBSCRIPTION#${USER_ID_REGEX_STR}#${UNIX_TIMESTAMP_REGEX_STR}$`
);

export const USER_SUB_STRIPE_ID_REGEX = /^sub_[a-zA-Z0-9]{14}$/;
