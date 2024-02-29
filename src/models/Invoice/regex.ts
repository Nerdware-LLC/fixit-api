import { USER_ID_REGEX_STR } from "@/models/User/regex.js";
import { UUID_V1_REGEX_STR } from "@/utils/regex.js";

export const INVOICE_SK_PREFIX_STR = "INV";
export const INVOICE_SK_REGEX_STR = `^${INVOICE_SK_PREFIX_STR}#${USER_ID_REGEX_STR}#${UUID_V1_REGEX_STR}$`;
export const INVOICE_SK_REGEX = new RegExp(INVOICE_SK_REGEX_STR);
