import { isString } from "@nerdware/ts-type-safety-utils";
import { LOCATION_COMPOSITE_REGEX } from "./regex.js";
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

  public static get KEYS(): Array<keyof Location> {
    return ["country", "region", "city", "streetLine1", "streetLine2"];
  }

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
    // this returns the "location" composite value as a single string with "#" as the field delimeter
    return [
      countryRawInput,
      regionRawInput,
      cityRawInput,
      streetLine1RawInput,
      streetLine2RawInput,
    ].reduce((accum: string, currentRawInput, index) => {
      // "streetLine2RawInput" is optional - skip processing if null
      if (!isString(currentRawInput)) return accum;

      /* For all "location" values, underscores are not valid in the raw input, but we can't
      catch underscores in the Model attribute validation regex since spaces are replaced with
      underscores. We could `throw new Error` from this `transformValue` fn if the raw input
      includes an underscore, but such input-validation logic falls outside of the scope and
      intended purpose of the `transformValue` methods. In the interest of keeping the input-
      validation logic within the `validate`/`validateItem` methods, this fn simply replaces
      underscores with the string literal "%_UNDERSCORE_%"; since "%" signs are invalid chars,
      the validate field regex catches the invalid input, and the resultant error msg informs
      the user that underscores are invalid.  */
      let formattedInput = currentRawInput.replace(/_/g, "%_UNDERSCORE_%");

      // For all "location" values, replace spaces with underscores
      formattedInput = formattedInput.replace(/\s/g, "_");

      /* "streetLine2RawInput" (index 4) may include "#" chars (e.g., "Ste_#_398"), so
      any provided number signs need to be replaced since they're used as the composite
      value delimeter. Here they're replaced with the string literal "NUMSIGN".
      For all other "location" fields, num signs are invalid, so like the treatment of
      underscores described above, invalid num signs are replaced with the string literal
      "%_NUMSIGN_%" so the "validation" function can catch it.  */
      formattedInput = formattedInput.replace(/#/g, index === 4 ? "NUMSIGN" : "%_NUMSIGN_%");

      /* All segments of the "location" composite attribute value except for the
      first one ("country") must be prefixed with "#", the delimeter.         */
      accum = index !== 0 ? `${accum}#${formattedInput}` : formattedInput;

      return accum;
    }, ""); // <-- reducer init accum is an empty string
  };

  /**
   * Convert a Location DDB-compound-string into a Location object.
   * This is used in `transformValue.fromDB` methods of DdbSingleTable model schema.
   */
  public static parseCompoundString = (locationCompoundStr: string) => {
    if (!isString(locationCompoundStr)) return locationCompoundStr;
    // Split the composite value string using the "#" delimeter
    const locationComponents = locationCompoundStr.split("#");
    // If length is less than 4, throw an error
    if (locationComponents.length < 4) {
      throw new Error(
        `Invalid Location: "${locationCompoundStr}" is not a valid Location compound string.`
      );
    }

    // Reduce the array into a Location object
    const locationObject = locationComponents.reduce((accum, dbValue, index) => {
      let formattedOutput = dbValue;

      // Format non-null values
      if (isString(formattedOutput)) {
        // Replace "NUMSIGN" string literal with "#" (for streetLine2)
        formattedOutput = formattedOutput.replace(/NUMSIGN/g, "#");
        // Replace underscores with spaces
        formattedOutput = formattedOutput.replace(/_/g, " ");
      }

      // Get location key from array, and set the Location K-V
      accum[Location.KEYS[index]!] = formattedOutput;

      return accum;
    }, {} as Location);

    // Provide the `locationObject` to the Location constructor
    return Location.fromParams(locationObject);
  };

  /**
   * Validates a Location DDB-compound-string for use in DdbSingleTable model schema.
   */
  public static validateCompoundString = (locationCompoundStr?: unknown) => {
    // The test method doesn't throw when given invalid arg types, so it's safe to cast here.
    return LOCATION_COMPOSITE_REGEX.test(locationCompoundStr as string);
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
