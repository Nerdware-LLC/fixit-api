import { USER_ID_REGEX_STR } from "@models/User/regex";
import { UNIX_TIMESTAMP_REGEX_STR } from "@utils/regex";

export const USER_SUBSCRIPTION_SK_PREFIX_STR = "SUBSCRIPTION";
export const USER_SUBSCRIPTION_SK_REGEX_STR = `^${USER_SUBSCRIPTION_SK_PREFIX_STR}#${USER_ID_REGEX_STR}#${UNIX_TIMESTAMP_REGEX_STR}$`;
export const USER_SUBSCRIPTION_SK_REGEX = new RegExp(USER_SUBSCRIPTION_SK_REGEX_STR);

/**
 * Stripe subscription id regex
 * > Example id: `"sub_1M55RlC34C0mN67JGYSD4btX"`
 */
export const USER_SUB_STRIPE_ID_REGEX = /^sub_[a-zA-Z0-9]{10,}$/;
