import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";

export const getScalarErrMsg = (scalarType: string, invalidValue: unknown) => {
  return (
    `[${scalarType.toUpperCase()} SCALAR ERROR]: ` +
    `Client provided an invalid ${scalarType.toLowerCase()}: ` +
    safeJsonStringify(invalidValue)
  );
};
