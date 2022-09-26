export {};

// Globally-available ambient definitions
declare global {
  /*
    TODO rm defs here once Apollo codegen typedefs are downloaded
  */

  type Location = {
    country?: string; // optional, defaults to "USA"
    region: string;
    city: string;
    streetLine1: string;
    streetLine2?: string; // optional, undefined by default
  };
}
