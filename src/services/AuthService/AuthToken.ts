import { isString } from "@nerdware/ts-type-safety-utils";
import { AuthError, InternalServerError } from "@/utils/httpErrors.js";
import { JWT } from "@/utils/jwt.js";
import type { AuthTokenPayload } from "@/types/open-api.js";
import type { Request } from "express";
import type { SetOptional } from "type-fest";

/**
 * The AuthToken class is responsible for creating, validating, and decoding
 * JSON Web Tokens (JWTs) used for authentication in the Fixit API.
 */
export class AuthToken {
  /**
   * Creates a new AuthToken by signing and encoding a JWT payload using the provided user data.
   * @param userData - The user data used to create the JWT payload.
   */
  static readonly create = (userData: CreateAuthTokenParams) => new AuthToken(userData);

  /**
   * Validates and decodes an encoded auth token.
   * @param encodedAuthToken - The encoded auth token to validate and decode.
   * @returns The decoded auth token payload.
   */
  static readonly validateAndDecode = async (encodedAuthToken: string) => {
    return await JWT.validateAndDecode<AuthTokenPayload>(encodedAuthToken, {
      shouldStripInternalFields: true,
      decodeErrMsgs: {
        TokenExpiredError: "Your login credentials have expired — please sign in again.",
        JsonWebTokenError: "Signature verification failed",
        default: "Invalid auth token",
      },
    });
  };

  /**
   * Extracts a raw auth token string from the "Authorization" header of an incoming request.
   */
  static readonly getAuthHeaderToken = <R extends Request>(req: R) => {
    // Get token from "Authorization" header
    let token = req.get("Authorization");
    // Ensure token exists and is a string
    if (!token || !isString(token)) throw new AuthError("Invalid auth token");
    // Remove 'Bearer ' from string if present
    if (token.startsWith("Bearer ")) token = token.split(" ")[1]!;
    return token;
  };

  /**
   * Validates the "Authorization" header of an incoming request and returns the decoded payload if valid.
   * @param request - The incoming request object.
   * @returns The decoded auth token payload.
   * @throws Error if the token is invalid.
   */
  static readonly getValidatedRequestAuthTokenPayload = async (request: Request) => {
    // Get token from "Authorization" header
    const token = AuthToken.getAuthHeaderToken(request);
    // Validate the token; if valid, returns decoded payload.
    return await AuthToken.validateAndDecode(token);
  };

  private readonly encodedTokenValue: string;

  /**
   * This method causes `encodedTokenValue` to be returned whenever type coercion occurs.
   *
   * > Although this method takes precedence over `toString` and `valueOf` whenever
   *   _**implicit**_ type coercion occurs, it is not called if/when `toString` or
   *   `valueOf` are called _**explicitly**_. Therefore, all 3 methods are implemented
   *   here to ensure that the token is always returned when type coercion occurs.
   */
  [Symbol.toPrimitive]() {
    return this.encodedTokenValue;
  }
  valueOf() {
    return this.encodedTokenValue;
  }
  toString() {
    return this.encodedTokenValue;
  }

  /**
   * Creates a new AuthToken by signing and encoding a JWT payload using the provided user data.
   * @param userData - The user data used to create the JWT payload.
   */
  constructor(userData: CreateAuthTokenParams) {
    // Destructure the userData
    const {
      id, handle, email, phone, profile, stripeCustomerID, stripeConnectAccount, subscription, createdAt, updatedAt
    } = userData; // prettier-ignore

    // Ensure required fields are present
    // prettier-ignore
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!id || !handle || !email || !profile || !stripeCustomerID || !stripeConnectAccount || !createdAt || !updatedAt)
      throw new InternalServerError("Invalid user data provided to AuthToken constructor");

    // Form the token payload using only the permitted fields
    const payload: AuthTokenPayload = {
      id,
      handle,
      email,
      phone: phone ?? null,
      profile,
      stripeCustomerID,
      stripeConnectAccount: {
        id: stripeConnectAccount.id,
        detailsSubmitted: stripeConnectAccount.detailsSubmitted,
        chargesEnabled: stripeConnectAccount.chargesEnabled,
        payoutsEnabled: stripeConnectAccount.payoutsEnabled,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
      createdAt,
      updatedAt,
    };

    this.encodedTokenValue = JWT.signAndEncode(payload);
  }
}

export type CreateAuthTokenParams = SetOptional<AuthTokenPayload, "phone" | "subscription">;
