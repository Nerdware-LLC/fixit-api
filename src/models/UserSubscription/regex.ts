import { USER_ID_REGEX_STR } from "@/models/User/regex";
import { UUID_V1_REGEX_STR } from "@/utils/regex";

export const USER_SUB_SK_PREFIX_STR = "SUBSCRIPTION";
export const USER_SUB_SK_REGEX_STR = `^${USER_SUB_SK_PREFIX_STR}#${USER_ID_REGEX_STR}#${UUID_V1_REGEX_STR}$`;
export const USER_SUB_SK_REGEX = new RegExp(USER_SUB_SK_REGEX_STR);
