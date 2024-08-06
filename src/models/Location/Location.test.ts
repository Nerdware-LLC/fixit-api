import { Location } from "./Location.js";

/** A valid Location object. */
const TEST_LOCATION = {
  country: Location.DEFAULT_COUNTRY,
  region: "California",
  city: "San Francisco",
  streetLine1: "123 Main St.",
  streetLine2: "Apt 4",
};

/** {@link TEST_LOCATION} in compound-string form. */
const TEST_LOCATION_COMPOUND_STRING = "USA#California#San%20Francisco#123%20Main%20St.#Apt%204";

describe("Location Model", () => {
  /* Explicitly set TEST_LOCATION prototype so `toStrictEqual` works
  as expected without having to use functions included in the SUT.*/
  beforeAll(() => {
    Object.setPrototypeOf(TEST_LOCATION, Location.prototype);
  });

  describe("new Location()", () => {
    test("returns a Location object with expected keys and values", () => {
      // The TEST_LOCATION object is used for required values
      const location = new Location({
        region: TEST_LOCATION.region,
        city: TEST_LOCATION.city,
        streetLine1: TEST_LOCATION.streetLine1,
        streetLine2: "", // <-- empty strings should yield null
        // country          <-- optional field should be populated with default
      });

      expect(location).toStrictEqual(
        new Location({
          ...TEST_LOCATION,
          country: Location.DEFAULT_COUNTRY,
          streetLine2: null,
        })
      );
    });

    test("throws an error when creating a Location object with missing required fields", () => {
      expect(() => {
        new Location({
          region: "California",
          city: "San Francisco",
        } as any);
      }).toThrow(`Invalid Location: "street line 1" is required`);
    });
  });

  describe("Location.convertToCompoundString()", () => {
    test("returns a compound string in the expected format", () => {
      const location1 = new Location(TEST_LOCATION);
      const location2 = new Location({
        ...TEST_LOCATION,
        streetLine1: "456 Foo Blvd.",
        streetLine2: undefined as any,
      });
      const result1 = Location.convertToCompoundString(location1);
      const result2 = Location.convertToCompoundString(location2);
      expect(result1).toStrictEqual(TEST_LOCATION_COMPOUND_STRING);
      expect(result2).toBe("USA#California#San%20Francisco#456%20Foo%20Blvd.#");
    });
  });

  describe("Location.parseCompoundString()", () => {
    test("returns expected Location object when called with a compound string", () => {
      const result = Location.parseCompoundString(TEST_LOCATION_COMPOUND_STRING);
      expect(result).toStrictEqual(TEST_LOCATION);
    });

    test("throws an error when parsing an invalid compound string into a Location object", () => {
      const compoundString = "invalid_string";
      expect(() => {
        Location.parseCompoundString(compoundString);
      }).toThrow(`Invalid Location: "invalid_string" is not a valid Location compound string.`);
    });
  });
});
