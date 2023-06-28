import { InternalServerError } from "@utils/customErrors/500_InternalServerError";
import { hasKey } from "./hasKey";
import { safeJsonStringify } from "./safeJsonStringify";

/**
 * Internal type-safety util which guarantees the returned object is an `Error`.
 * Along with `Error`-instance properties, the return-type also includes optional
 * properties which exist on `InternalServerError` instances to allow for easier
 * reads/type-checking.
 */
export const getTypeSafeError = (
  err: unknown,
  fallBackErrMsg: string = "An unknown error occurred."
): Error & { name?: string; status?: number; statusCode?: number } => {
  return err instanceof Error
    ? err
    : err === null || err === undefined
    ? new InternalServerError(fallBackErrMsg)
    : typeof err === "string" && err !== ""
    ? new InternalServerError(err)
    : typeof err === "object" && !Array.isArray(err) && hasKey(err, "message")
    ? new InternalServerError(err.message)
    : new InternalServerError(
        `${fallBackErrMsg}\nOriginal error payload: ${safeJsonStringify(err)}`
      );
};
