import { InternalServerError } from "./500_InternalServerError";

export const getTypeSafeErr = (
  err: ErrorLike,
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
