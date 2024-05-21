import { isString } from "@nerdware/ts-type-safety-utils";
import { AuthError } from "@/utils/httpErrors.js";
import type { Request } from "express";

/**
 * Extracts a raw auth token string from the "Authorization" header of an incoming request.
 */
export const getAuthHeaderToken = <R extends Request>(req: R) => {
  // Get token from "Authorization" header
  let token = req.get("Authorization");

  // Ensure token exists and is a string
  if (!token || !isString(token)) throw new AuthError("Invalid auth token");

  // Remove 'Bearer ' from string if present
  if (token.startsWith("Bearer ")) token = token.split(" ")[1]!;

  return token;
};
