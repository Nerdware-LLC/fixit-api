import { InternalServerError } from "./500_InternalServerError";

export const getTypeSafeErr = (err: ErrorLike) => {
  return err instanceof Error
    ? err
    : err === null || err === undefined
    ? new InternalServerError(FALLBACK_ERROR_MSG)
    : typeof err === "string" && err !== ""
    ? new InternalServerError(err)
    : typeof err === "object" &&
      !Array.isArray(err) &&
      Object.prototype.hasOwnProperty.call(err, "message")
    ? new InternalServerError((err as { message: string }).message)
    : new InternalServerError(
        // prettier-ignore
        `${FALLBACK_ERROR_MSG} Original error payload: ${typeof err !== "bigint" ? JSON.stringify(err) : "[BigInt]"}`
      );
};

const FALLBACK_ERROR_MSG = "An unknown error occurred.";
