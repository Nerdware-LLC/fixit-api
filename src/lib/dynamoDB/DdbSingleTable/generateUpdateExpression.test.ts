import { generateUpdateExpression } from "./generateUpdateExpression";

describe("generateUpdateExpression()", () => {
  test("returns an empty UpdateExpression when itemAttributes is an empty object", () => {
    const result = generateUpdateExpression({});
    expect(result.UpdateExpression).toBe("");
  });

  test("returns the expected values when called with truthy string/number/object attributes", () => {
    const result = generateUpdateExpression({ attr1: "foo", attr2: 22, attr3: [{ nested: true }] });
    expect(result.UpdateExpression).toBe("SET #attr1 = :attr1, #attr2 = :attr2, #attr3 = :attr3");
    expect(result.ExpressionAttributeNames).toEqual({
      "#attr1": "attr1",
      "#attr2": "attr2",
      "#attr3": "attr3",
    });
    expect(result.ExpressionAttributeValues).toEqual({
      ":attr1": "foo",
      ":attr2": 22,
      ":attr3": [{ nested: true }],
    });
  });

  test(`returns the expected values when called with null/undefined attributes and "nullHandling" is "REMOVE"`, () => {
    const result = generateUpdateExpression(
      { attr1: null, attr2: undefined },
      { nullHandling: "REMOVE" }
    );
    expect(result.UpdateExpression).toBe("REMOVE #attr1, #attr2");
    expect(result.ExpressionAttributeNames).toEqual({ "#attr1": "attr1", "#attr2": "attr2" });
    expect(result.ExpressionAttributeValues).toEqual({});
  });

  test(`returns the expected values when called with null/undefined attributes and "nullHandling" is "SET"`, () => {
    const result = generateUpdateExpression(
      { attr1: null, attr2: undefined },
      { nullHandling: "SET" }
    );
    expect(result.UpdateExpression).toBe("SET #attr1 = :attr1 REMOVE #attr2");
    expect(result.ExpressionAttributeNames).toEqual({ "#attr1": "attr1", "#attr2": "attr2" });
    expect(result.ExpressionAttributeValues).toEqual({ ":attr1": null });
  });
});
