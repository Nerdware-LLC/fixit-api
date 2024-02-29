import type { Simplify, UnionToIntersection } from "type-fest";
import type { paths, components } from "./__codegen__/open-api.js";

/** This codegen'd type reflects the `"paths"` of the REST API's OpenAPI schema. */
export type OpenApiPaths = paths;

/** This codegen'd type reflects the `"requestBodies"` of the REST API's OpenAPI schema. */
export type OpenApiRequestBodies = components["requestBodies"];

/** This codegen'd type reflects the `"responses"` of the REST API's OpenAPI schema. */
export type OpenApiResponses = components["responses"];

/** This codegen'd type reflects the `"schemas"` of the REST API's OpenAPI schema. */
export type OpenApiSchemas = components["schemas"];

///////////////////////////////////////////////////////////////////////////////
// REST API Endpoint Paths

/** A union of REST API **`POST`** endpoints. */
export type RestApiPOSTendpoint = {
  [Path in keyof paths]: paths[Path] extends { post: { requestBody?: BaseJsonContent } }
    ? BaseJsonContent extends paths[Path]["post"]["requestBody"]
      ? Path
      : never
    : never;
}[keyof paths];

/** A union of REST API **`GET`** endpoints. */
export type RestApiGETendpoint = {
  [Path in keyof paths]: paths[Path] extends GETOperationWithJson200Response ? Path : never;
}[keyof paths];

///////////////////////////////////////////////////////////////////////////////
// REST API Request Body Types

/** A map of REST API **`POST`** endpoints to their respective request-body objects. */
export type RestApiRequestBodyByPath = {
  [Path in RestApiPOSTendpoint]: Simplify<
    NonNullable<paths[Path]["post"]["requestBody"]>["content"]["application/json"]
  >;
};

///////////////////////////////////////////////////////////////////////////////
// REST API Response Types

/** A map of REST API **`POST`** endpoints to their respective 200-response objects. */
export type RestApiPOST200ResponseByPath = {
  [Path in RestApiPOSTendpoint as paths[Path] extends POSTOperationWithJson200Response
    ? Path
    : never]: paths[Path] extends POSTOperationWithJson200Response
    ? Simplify<paths[Path]["post"]["responses"][200]["content"]["application/json"]>
    : never;
};

/** A map of REST API **`GET`** endpoints to their respective 200-response objects. */
export type RestApiGET200ResponseByPath = {
  [Path in RestApiGETendpoint as paths[Path] extends GETOperationWithJson200Response
    ? Path
    : never]: paths[Path] extends GETOperationWithJson200Response
    ? Simplify<paths[Path]["get"]["responses"][200]["content"]["application/json"]>
    : never;
};

/** A map of REST API endpoints to their respective 200-response objects (includes POST and GET endpoints). */
export type RestApiResponseByPath = Simplify<
  RestApiPOST200ResponseByPath & RestApiGET200ResponseByPath
>;

/** An intersection of every 200-response object sent from this API's REST endpoints. */
export type AllRestApiResponses = Partial<
  UnionToIntersection<RestApiResponseByPath[keyof RestApiResponseByPath]>
>;

/** The shape of a POST operation with a JSON 200-response. */
type POSTOperationWithJson200Response = { post: { responses: { 200: BaseJsonContent } } };

/** The shape of a GET operation with a JSON 200-response. */
type GETOperationWithJson200Response = { get: { responses: { 200: BaseJsonContent } } };

///////////////////////////////////////////////////////////////////////////////
// Shared Request/Response Base Types

/** The shape of JSON `content` in OpenAPI request and response objects. */
type BaseJsonContent = { content: { "application/json": any } };
