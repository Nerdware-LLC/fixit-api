import { UUID_V1_REGEX_STR } from "@utils/regex";

export const USER_ID_REGEX_STR = `USER#${UUID_V1_REGEX_STR}`;
export const USER_ID_REGEX = new RegExp(`^${USER_ID_REGEX_STR}$`);
export const USER_SK_REGEX = new RegExp(`^#DATA#${USER_ID_REGEX_STR}$`);
export const USER_STRIPE_CUSTOMER_ID_REGEX = /^cus_[a-zA-Z0-9]{14}$/; // Example from Stripe docs: "cus_IiU67YFNrznvI3"
