import { isString } from "@nerdware/ts-type-safety-utils";
import { getCompoundAttrString, parseCompoundAttrString } from "@/models/_common";
import { LOCATION_COMPOUND_STR_REGEX } from "./helpers.js";
import type { Location as GqlSchemaLocationType } from "@/types/graphql.js";

/**
 * Location Model
 *
 * This model is used to represent a physical location in the real world. In the API context,
 * locations are objects with properties like `"city"`, `"state"`, `"streetLine1"`, etc. In the
 * DDB database, however, under the hood each location is stored as a single compound-attribute
 * string value in the following format:
 *
 * `[COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]`
 *
 * This is done to facilitate flexible querying of the DDB db for access patterns like "Find all
 * work orders on Foo Street".
 */
export class Location implements GqlSchemaLocationType {
  country: string;
  region: string;
  city: string;
  streetLine1: string;
  streetLine2?: string | null;

  public static DEFAULT_COUNTRY = "USA" as const satisfies string;

  /**
   * Convert a Location object into a DDB compound attribute string.
   * This is used in `transformValue.toDB` methods of DdbSingleTable model schema.
   */
  public static convertToCompoundString = ({
    country: countryRawInput = Location.DEFAULT_COUNTRY,
    region: regionRawInput,
    city: cityRawInput,
    streetLine1: streetLine1RawInput,
    streetLine2: streetLine2RawInput = null,
  }: Location): string => {
    return getCompoundAttrString(
      [countryRawInput, regionRawInput, cityRawInput, streetLine1RawInput, streetLine2RawInput],
      { shouldUrlEncode: true }
    );
  };

  /**
   * Convert a Location DDB-compound-string into a Location object.
   * This is used in `transformValue.fromDB` methods of DdbSingleTable model schema.
   */
  public static parseCompoundString = (locationCompoundStr: string) => {
    // Sanity check: If the input is not a string, just return it as-is
    if (!isString(locationCompoundStr)) return locationCompoundStr;
    // Split the compound value string using the "#" delimeter
    const locationComponents = parseCompoundAttrString(locationCompoundStr, {
      shouldUrlDecode: true,
    });
    // If length is not 5, throw an error
    if (locationComponents.length !== 5)
      throw new Error(
        `Invalid Location: "${locationCompoundStr}" is not a valid Location compound string.`
      );

    // Destructure the array's Location fields
    const [country, region, city, streetLine1, streetLine2] = locationComponents;

    // Provide the `locationObject` to the Location constructor
    return Location.fromParams({ country, region, city, streetLine1, streetLine2 });
  };

  /**
   * Validates a Location DDB-compound-string for use in DdbSingleTable model schema.
   */
  public static validateCompoundString = (locationCompoundStr?: unknown) => {
    // The test method doesn't throw when given invalid arg types, so it's safe to cast here.
    return LOCATION_COMPOUND_STR_REGEX.test(locationCompoundStr as string);
  };

  /**
   * Returns a `Location`-shaped object from the given params.
   */
  static readonly fromParams = (params?: unknown) => new Location(params as Location);

  constructor({
    country = Location.DEFAULT_COUNTRY,
    region,
    city,
    streetLine1,
    streetLine2,
  }: Omit<Location, "country"> & { country?: string }) {
    // Ensure values have been provided for all required Location fields
    const missingRequiredFields: Array<string> = [];

    if (!region) missingRequiredFields.push("region");
    if (!city) missingRequiredFields.push("city");
    if (!streetLine1) missingRequiredFields.push("street line 1");

    if (missingRequiredFields.length > 0) {
      throw new Error(
        `Invalid Location: "${missingRequiredFields.join(", ")}" ` +
          `${missingRequiredFields.length > 1 ? "are" : "is"} required`
      );
    }

    this.country = country || Location.DEFAULT_COUNTRY;
    this.region = region;
    this.city = city;
    this.streetLine1 = streetLine1;
    this.streetLine2 = streetLine2 || null;
  }
}
