import { USER_ID_REGEX_STR } from "@models/User/regex";

export const CONTACT_SK_PREFIX_STR = "CONTACT";
export const CONTACT_SK_REGEX_STR = `^${CONTACT_SK_PREFIX_STR}#${USER_ID_REGEX_STR}$`;
export const CONTACT_SK_REGEX = new RegExp(CONTACT_SK_REGEX_STR);
