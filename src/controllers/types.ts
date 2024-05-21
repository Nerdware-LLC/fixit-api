import type {
  Paths,
  RestApiEndpoint,
  RestApiRequestBodyByPath,
  RestApiResponseByPath,
} from "@/types/open-api.js";
import type { RequestHandler } from "express";
import type { SetReturnType } from "type-fest";

/**
 * An API controller with `req` and `res` type definitions which match
 * the REST API endpoint as defined in the OpenAPI schema.
 */
export type ApiController<
  Path extends RestApiEndpoint,
  ReturnType extends void | Promise<void> = Promise<void>,
> = SetReturnType<
  RequestHandler<
    Paths[Path]["parameters"]["path"] extends object
      ? Paths[Path]["parameters"]["path"]
      : Record<string, string>,
    RestApiResponseByPath[Path],
    Path extends keyof RestApiRequestBodyByPath ? RestApiRequestBodyByPath[Path] : never,
    Paths[Path]["parameters"]["query"] extends object
      ? Paths[Path]["parameters"]["query"]
      : Record<string, string>,
    Record<string, unknown>
  >,
  ReturnType
>;
