import { getExpressionAttrTokens } from "./ddbExpressionHelpers";
import { DdbSingleTableError } from "./errors";

describe("getExpressionAttrTokens()", () => {
  test("returns the correct tokens when called with an alphanumeric attrName arg", () => {
    const result = getExpressionAttrTokens("foo1");
    expect(result).toEqual({ attrNamesToken: "#foo1", attrValuesToken: ":foo1" });
  });

  test("returns the correct tokens when called with an attrName arg with special chars", () => {
    const result = getExpressionAttrTokens("foo-AttrName_1");
    expect(result).toEqual({ attrNamesToken: "#fooAttrName1", attrValuesToken: ":fooAttrName1" });
  });

  test("returns the correct tokens when called with a 1-letter attrName arg", () => {
    const result = getExpressionAttrTokens("x");
    expect(result).toEqual({ attrNamesToken: "#x", attrValuesToken: ":x" });
  });

  test("returns the correct tokens when called with an integer attrName arg", () => {
    const result = getExpressionAttrTokens(`1`);
    expect(result).toEqual({ attrNamesToken: "#1", attrValuesToken: ":1" });
  });

  test(`throws "DdbSingleTableError" when called with an empty string`, () => {
    expect(() => getExpressionAttrTokens("")).toThrowError(DdbSingleTableError);
  });
});
