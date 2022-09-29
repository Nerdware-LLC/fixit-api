import { USER_ID_REGEX_STR } from "@models/User";

export const CONTACT_SK_REGEX = new RegExp(`^CONTACT#${USER_ID_REGEX_STR}$`);
