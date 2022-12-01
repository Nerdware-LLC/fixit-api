export {};

declare global {
  /*
    TODO rm this once relevant refs are migrated to use the GQL codegen-generated types
  */

  type Location = {
    country?: string; // optional, defaults to "USA"
    region: string;
    city: string;
    streetLine1: string;
    streetLine2?: string; // optional, undefined by default
  };
}
