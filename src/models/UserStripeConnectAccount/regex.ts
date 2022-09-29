import { USER_ID_REGEX_STR } from "@models/User";

export const STRIPE_CONNECT_ACCOUNT_SK_REGEX = new RegExp(
  `^STRIPE_CONNECT_ACCOUNT#${USER_ID_REGEX_STR}$`
);
