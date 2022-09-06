import { UUID_V1_REGEX_STR } from "@utils/regex";

export const USER_ID_REGEX_STR = `USER#${UUID_V1_REGEX_STR}`;
export const USER_ID_REGEX = new RegExp(`^${USER_ID_REGEX_STR}$`);