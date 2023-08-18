import { UUID_V1_REGEX_STR } from "@utils/regex";

export const USER_ID_PREFIX_STR = "USER";
export const USER_ID_REGEX_STR = `${USER_ID_PREFIX_STR}#${UUID_V1_REGEX_STR}`;
export const USER_ID_REGEX = new RegExp(`^${USER_ID_REGEX_STR}$`);

export const USER_SK_PREFIX_STR = "#DATA";
export const USER_SK_REGEX = new RegExp(`^${USER_SK_PREFIX_STR}#${USER_ID_REGEX_STR}$`);
