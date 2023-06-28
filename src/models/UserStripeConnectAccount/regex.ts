import { USER_ID_REGEX_STR } from "@models/User";

export const STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR = "STRIPE_CONNECT_ACCOUNT";
export const STRIPE_CONNECT_ACCOUNT_SK_REGEX = new RegExp(
  `^${STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR}#${USER_ID_REGEX_STR}$`
);

/**
 * Stripe connect account id regex
 * > Example id: `"acct_1GpaAGC34C0mN67J"`
 */
export const STRIPE_CONNECT_ACCOUNT_STRIPE_ID_REGEX = /^acct_[a-zA-Z0-9]{10,}$/;
