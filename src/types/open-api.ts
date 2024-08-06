import type { Simplify, RequiredKeysOf } from "type-fest";
import type { paths, components, operations } from "./__codegen__/open-api.js";
import type { CombineUnionOfObjects } from "./helpers.js";

export type Paths = Simplify<paths>;

/** This codegen'd type reflects the `"schemas"` of the REST API's OpenAPI schema. */
export type OpenApiSchemas = components["schemas"];

///////////////////////////////////////////////////////////////////////////////
// REST API Endpoint Paths

/** A union of available REST API endpoints. */
export type RestApiEndpoint = Simplify<keyof paths>;

/** A union of REST API **`POST`** endpoints. */
export type RestApiPOSTendpoint = {
  [Path in keyof paths]: paths[Path] extends { post: Record<string, unknown> } ? Path : never;
}[keyof paths];

/** A union of REST API **`GET`** endpoints. */
export type RestApiGETendpoint = {
  [Path in keyof paths]: paths[Path] extends { get: Record<string, unknown> } ? Path : never;
}[keyof paths];

///////////////////////////////////////////////////////////////////////////////
// REST API Request Body Types

/** A map of REST API **`POST`** endpoints to their respective request-body objects. */
export type RestApiRequestBodyByPath = {
  [Path in RestApiPOSTendpoint]: undefined extends paths[Path]["post"]["requestBody"]
    ?
        | CombineUnionOfObjects<ExtractPOSTRequestBodyContent<paths[Path]["post"]["requestBody"]>>
        | undefined
    : CombineUnionOfObjects<ExtractPOSTRequestBodyContent<paths[Path]["post"]["requestBody"]>>;
};

/** Extract the type/shape of a POST request's `req.body` () */
type ExtractPOSTRequestBodyContent<
  ReqBody extends paths[RestApiPOSTendpoint]["post"]["requestBody"],
  ReqBodyContent = NonNullable<ReqBody>["content"],
> = ReqBodyContent extends { "application/json": infer JsonReqBody }
  ? JsonReqBody
  : ReqBodyContent extends { "application/csp-report": infer CspReqBody }
    ? CspReqBody
    : never;

///////////////////////////////////////////////////////////////////////////////
// REST API Response Types

/** The shape of a response object with JSON content. */
type BaseResponseContentJson = {
  content: { "application/json": Record<string, unknown> };
};

/** The shape of an OpenAPI operation with success-response status codes. */
type BaseOpSuccessResponses = operations[keyof operations] & {
  responses: {
    200?: BaseResponseContentJson;
    201?: BaseResponseContentJson;
    204?: { content?: never };
  };
};

/** Returns the 200/201/204 success-response object for the provided `Path` (204 content=never). */
type PathEndpointSuccessResponseContent<Path extends RestApiEndpoint> =
  paths[Path]["get"] extends BaseOpSuccessResponses
    ? ExtractSuccessResponseContentFromOp<paths[Path]["get"]>
    : paths[Path]["post"] extends BaseOpSuccessResponses
      ? ExtractSuccessResponseContentFromOp<paths[Path]["post"]>
      : never;

/** Extracts the 200/201/204 success-response object from the provided `Op` (204 content=never). */
type ExtractSuccessResponseContentFromOp<Op extends BaseOpSuccessResponses> =
  Op["responses"][200] extends BaseResponseContentJson
    ? Op["responses"][200]["content"]["application/json"]
    : Op["responses"][201] extends BaseResponseContentJson
      ? Op["responses"][201]["content"]["application/json"]
      : Op["responses"][204] extends { content?: never }
        ? Op["responses"][204]["content"]
        : never;

/** A map of REST API **`POST`** endpoints to their respective success-response objects. */
type RestApiPOSTSuccessResponseByPath = {
  [Path in RestApiPOSTendpoint]: PathEndpointSuccessResponseContent<Path>;
};

/** A map of REST API **`GET`** endpoints to their respective success-response objects. */
type RestApiGETSuccessResponseByPath = {
  [Path in RestApiGETendpoint]: PathEndpointSuccessResponseContent<Path>;
};

/** A map of REST API endpoints to their respective 200-response objects (includes POST and GET endpoints). */
export type RestApiResponseByPath = Simplify<
  RestApiPOSTSuccessResponseByPath & RestApiGETSuccessResponseByPath
>;

// Response Schema Types:

/** The decoded payload of a Fixit API auth token. */
export type AuthTokenPayload = OpenApiSchemas["AuthTokenPayload"];
/** Pre-fetched User items. */
export type PreFetchedUserItems = OpenApiSchemas["PreFetchedUserItems"];
/** Info returned from the checkout-completion endpoint. */
export type CheckoutCompletionInfo = OpenApiSchemas["CheckoutCompletionInfo"];
/** Info returned from the check-promo-code endpoint. */
export type PromoCodeInfo = OpenApiSchemas["PromoCodeInfo"];

///////////////////////////////////////////////////////////////////////////////
// OpenAPI Path Parameter Types (Path, Query, Header, Cookie)

type OpenApiSchemaParamType = "path" | "query" | "header" | "cookie";

/** The shape of a `parameters` object. */
type BaseParams<ParamType extends OpenApiSchemaParamType> = {
  parameters: Record<ParamType, Record<string, unknown>>;
};

/** Returns the `parameters` of the provided `ParamType` for the provided `Path`. */
export type RestApiParametersByPath<
  Path extends RestApiEndpoint,
  ParamType extends OpenApiSchemaParamType,
  Endpoint extends Paths[Path] = Paths[Path],
  HttpMethod extends EndpointHttpMethod<Path> = EndpointHttpMethod<Path>,
> =
  Endpoint extends BaseParams<ParamType>
    ? Endpoint["parameters"]["path"]
    : Endpoint[HttpMethod] extends BaseParams<ParamType>
      ? Endpoint[HttpMethod]
      : Record<string, unknown>;

/** Returns the HTTP method used by the given endpoint. */
type EndpointHttpMethod<Path extends RestApiEndpoint> = RequiredKeysOf<
  Omit<Paths[Path], "parameters">
>;
