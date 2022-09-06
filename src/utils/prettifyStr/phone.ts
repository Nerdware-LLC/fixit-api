/**
 * Converts "8881234567" into "(888) 123-4567". If provided arg
 * is not a string of 10 digits, the arg is returned as-is.
 */
export const prettifyPhoneNum = (phoneNum: string) => {
  return /^\d{10}$/.test(phoneNum)
    ? `(${phoneNum.substring(0, 3)}) ${phoneNum.substring(3, 6)}-${phoneNum.substring(6, 11)}`
    : phoneNum;
};
