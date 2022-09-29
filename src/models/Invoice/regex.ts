import { USER_ID_REGEX_STR } from "@models/User";
import { UNIX_TIMESTAMP_REGEX_STR } from "@utils/regex";

export const INVOICE_SK_REGEX = new RegExp(
  `^INV#${USER_ID_REGEX_STR}#${UNIX_TIMESTAMP_REGEX_STR}$`
);
