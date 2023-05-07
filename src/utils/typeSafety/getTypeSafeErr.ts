import { InternalServerError } from "../customErrors/500_InternalServerError";

/**
 * Internal function to get a type-safe error.
 */
export const getTypeSafeErr = (
  err: unknown,
  fallBackErrMsg: string = "An unknown error occurred."
): Error => {
  return err instanceof Error
    ? err
    : err === null || err === undefined
    ? new InternalServerError(fallBackErrMsg)
    : typeof err === "string" && err !== ""
    ? new InternalServerError(err)
    : typeof err === "object" &&
      !Array.isArray(err) &&
      Object.prototype.hasOwnProperty.call(err, "message")
    ? new InternalServerError((err as { message: string }).message)
    : new InternalServerError(
        // prettier-ignore
        `${fallBackErrMsg} Original error payload: ${typeof err !== "bigint" ? JSON.stringify(err) : "[BigInt]"}`
      );
};
