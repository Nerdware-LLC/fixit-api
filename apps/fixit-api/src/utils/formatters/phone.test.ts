import { prettifyPhoneNumStr } from "./phone.js";

describe("formatters/phone", () => {
  describe("prettifyPhoneNumStr()", () => {
    test(`formats a valid phone number string into a "pretty" format`, () => {
      expect(prettifyPhoneNumStr("1234567890")).toBe("(123) 456-7890");
      expect(prettifyPhoneNumStr(" 1234567890 ")).toBe("(123) 456-7890");
      expect(prettifyPhoneNumStr(" +(123)4567890  ")).toBe("(123) 456-7890");
    });
  });
});
