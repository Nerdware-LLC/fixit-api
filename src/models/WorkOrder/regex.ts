import { USER_ID_REGEX_STR } from "@/models/User/regex.js";
import { UUID_V1_REGEX_STR } from "@/utils/regex.js";

export const WORK_ORDER_SK_PREFIX_STR = "WO";
export const WORK_ORDER_ID_REGEX_STR = `${WORK_ORDER_SK_PREFIX_STR}#${USER_ID_REGEX_STR}#${UUID_V1_REGEX_STR}`;
export const WORK_ORDER_ID_REGEX = new RegExp(`^${WORK_ORDER_ID_REGEX_STR}$`);

export const WO_CHECKLIST_ITEM_ID_REGEX_STR = `^${WORK_ORDER_ID_REGEX_STR}#CHECKLIST_ITEM#${UUID_V1_REGEX_STR}$`;
export const WO_CHECKLIST_ITEM_ID_REGEX = new RegExp(WO_CHECKLIST_ITEM_ID_REGEX_STR);
