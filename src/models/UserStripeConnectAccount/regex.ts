import { USER_ID_REGEX_STR } from "@models/User";

export const STRIPE_CONNECT_ACCOUNT_SK_REGEX = new RegExp(
  `^STRIPE_CONNECT_ACCOUNT#${USER_ID_REGEX_STR}$`
);

export const STRIPE_CONNECT_ACCOUNT_STRIPE_ID_REGEX = /^acct_[a-zA-Z0-9]{16}$/;
