import { hasKey } from "./hasKey";
import { safeJsonStringify } from "./safeJsonStringify";
import type { HttpErrorInterface } from "@/utils/httpErrors";
import type { Class } from "type-fest";

/**
 * Internal type-safety util which guarantees the returned object is an `Error`.
 * Along with `Error`-instance properties, the return-type also includes optional
 * properties which exist on `InternalServerError` instances to allow for easier
 * reads/type-checking.
 */
export const getTypeSafeError = (
  err: unknown,
  {
    ErrorClass,
    fallBackErrMsg,
  }: {
    ErrorClass?: Class<Error>;
    fallBackErrMsg?: string;
  } = {}
): Partial<HttpErrorInterface> => {
  ErrorClass ??= Error;
  fallBackErrMsg ||= "An unknown error occurred.";

  return err instanceof Error
    ? err
    : err === null || err === undefined
    ? new ErrorClass(fallBackErrMsg)
    : typeof err === "string" && err !== ""
    ? new ErrorClass(err)
    : typeof err === "object" &&
      !Array.isArray(err) &&
      hasKey(err, "message") &&
      typeof err.message === "string"
    ? new ErrorClass(err.message)
    : new ErrorClass(`${fallBackErrMsg}\nOriginal error payload: ${safeJsonStringify(err)}`);
};

/**
 * Attempts to parse an error message from an unknown error.
 */
export const getErrorMessage = (err: unknown): string | undefined => {
  return typeof err === "string"
    ? err
    : !!err && typeof err === "object" && hasKey(err, "message") && typeof err.message === "string"
    ? err.message
    : undefined;
};
