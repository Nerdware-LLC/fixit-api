import { Location } from "./Location";

/** A valid Location object. */
const TEST_LOCATION = {
  country: "USA",
  region: "California",
  city: "San Francisco",
  streetLine1: "123 Main St.",
  streetLine2: "Apt 4",
};

const TEST_LOCATION_COMPOUND_STRING = "USA#California#San_Francisco#123_Main_St.#Apt_4";

describe("Location Model", () => {
  describe("new Location()", () => {
    test("returns a Location object with expected keys and values", () => {
      // Grab some values from the input object
      const { region, city, streetLine1 } = TEST_LOCATION;
      const location = new Location({
        region,
        city,
        streetLine1,
        streetLine2: "", // <-- empty strings should yield null
        // country         <-- optional fields should yield null
      });
      expect(location).toEqual({
        ...TEST_LOCATION,
        country: null,
        streetLine2: null,
      });
    });

    test("throws an error when creating a Location object with missing required fields", () => {
      expect(() => {
        new Location({
          region: "California",
          city: "San Francisco",
        } as any);
      }).toThrow();
    });
  });

  describe("Location.convertToCompoundString()", () => {
    test("returns a compound string in the expected format", () => {
      const location1 = new Location(TEST_LOCATION);
      const location2 = new Location({
        ...TEST_LOCATION,
        streetLine1: "456 Foo Blvd.",
        streetLine2: undefined,
      });
      const result1 = Location.convertToCompoundString(location1);
      const result2 = Location.convertToCompoundString(location2);
      expect(result1).toEqual(TEST_LOCATION_COMPOUND_STRING);
      expect(result2).toBe("USA#California#San_Francisco#456_Foo_Blvd.");
    });
  });

  describe("Location.parseCompoundString()", () => {
    test("returns expected Location object when called with a compound string", () => {
      const result = Location.parseCompoundString(TEST_LOCATION_COMPOUND_STRING);
      expect(result).toEqual(TEST_LOCATION);
    });

    test("throws an error when parsing an invalid compound string into a Location object", () => {
      const compoundString = "invalid_string";
      expect(() => {
        Location.parseCompoundString(compoundString);
      }).toThrow();
    });
  });
});
