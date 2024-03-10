import { USER_ID_REGEX_STR } from "@/models/User/regex.js";
import { UNIX_TIMESTAMP_REGEX_STR } from "@/utils/regex.js";

export const USER_SUB_SK_PREFIX_STR = "SUBSCRIPTION";
export const USER_SUB_SK_REGEX_STR = `^${USER_SUB_SK_PREFIX_STR}#${USER_ID_REGEX_STR}#${UNIX_TIMESTAMP_REGEX_STR}$`;
export const USER_SUB_SK_REGEX = new RegExp(USER_SUB_SK_REGEX_STR);
