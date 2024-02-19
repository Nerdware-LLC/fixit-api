import { signAndEncodeJWT, validateAndDecodeJWT } from "./jwt";
import type { UserItem } from "@/models/User";
import type { UserStripeConnectAccountItem } from "@/models/UserStripeConnectAccount";
import type { UserSubscriptionItem } from "@/models/UserSubscription";
import type { Request } from "express";
import type jwt from "jsonwebtoken";
import type { Simplify } from "type-fest";

/**
 * The AuthToken class is responsible for creating, validating, and decoding JSON
 * Web Tokens (JWTs) used for authentication in the Fixit API.
 */
export class AuthToken {
  private encodedTokenValue: string;

  /**
   * Creates a new AuthToken by signing and encoding a JWT payload using the provided user data.
   * @param userData - The user data used to create the JWT payload.
   */
  constructor(userData: FixitApiAuthTokenPayload) {
    const payload: FixitApiAuthTokenPayload = {
      id: userData.id,
      handle: userData.handle,
      email: userData.email,
      phone: userData.phone,
      profile: userData.profile,
      stripeCustomerID: userData.stripeCustomerID,
      ...(userData.stripeConnectAccount && {
        stripeConnectAccount: {
          id: userData.stripeConnectAccount.id,
          detailsSubmitted: !!userData.stripeConnectAccount.detailsSubmitted,
          chargesEnabled: !!userData.stripeConnectAccount.chargesEnabled,
          payoutsEnabled: !!userData.stripeConnectAccount.payoutsEnabled,
        },
      }),
      ...(userData.subscription && {
        subscription: {
          id: userData.subscription.id,
          status: userData.subscription.status,
          currentPeriodEnd: userData.subscription.currentPeriodEnd,
        },
      }),
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    this.encodedTokenValue = signAndEncodeJWT(payload);
  }

  /**
   * Returns the encoded auth token string.
   * @returns The encoded auth token string.
   */
  toString() {
    return this.encodedTokenValue;
  }

  /**
   * Validates and decodes an encoded auth token.
   * @param encodedAuthToken - The encoded auth token to validate and decode.
   * @returns The decoded auth token payload.
   */
  static validateAndDecodeAuthToken = async <
    IsSubscriptionDefinitelyPresent extends boolean = false,
    IsStripeConnectAccountDefinitelyPresent extends boolean = false,
  >(
    encodedAuthToken: string
  ) => {
    const decodedPayload = await validateAndDecodeJWT(encodedAuthToken);
    return AuthToken.stripInternalJwtPayloadFields(decodedPayload) as FixitApiAuthTokenPayload<
      IsSubscriptionDefinitelyPresent,
      IsStripeConnectAccountDefinitelyPresent
    >;
  };

  /**
   * Validates the "Authorization" header of an incoming request and returns the decoded payload if valid.
   * @param request - The incoming request object.
   * @returns The decoded auth token payload.
   * @throws Error if the token is invalid.
   */
  static getValidatedRequestAuthTokenPayload = async <
    IsSubscriptionDefinitelyPresent extends boolean = false,
    IsStripeConnectAccountDefinitelyPresent extends boolean = false,
  >(
    request: Request
  ) => {
    // Get token from "Authorization" header
    let token = request.get("Authorization");
    if (!token || typeof token !== "string") throw new Error("Invalid token");

    // Remove Bearer from string
    if (token.startsWith("Bearer ")) token = token.split(" ")[1]!;

    // Validate the token; if valid, return decoded payload
    const authTokenPayload = await this.validateAndDecodeAuthToken<
      IsSubscriptionDefinitelyPresent,
      IsStripeConnectAccountDefinitelyPresent
    >(token);

    return authTokenPayload;
  };

  /**
   * Strips internal JWT payload fields from a given payload.
   * @param payload - The JWT payload to strip internal fields from.
   * @returns The stripped payload.
   */
  static stripInternalJwtPayloadFields = <
    Payload extends Record<string, unknown> = FixitApiAuthTokenPayload,
  >(
    payload: Payload
  ) => {
    return Object.fromEntries(
      Object.entries(payload).filter(
        ([key]) => !["iss", "sub", "aud", "exp", "nbf", "iat", "jti"].includes(key)
      )
    ) as Omit<Payload, keyof jwt.JwtPayload>;
  };
}

/**
 * The decoded payload of a Fixit API auth token.
 */
export type FixitApiAuthTokenPayload<
  IsSubscriptionDefinitelyPresent extends boolean = false,
  IsStripeConnectAccountDefinitelyPresent extends boolean = false,
> = Simplify<
  AuthTokenUserFields &
    (IsStripeConnectAccountDefinitelyPresent extends true
      ? { stripeConnectAccount: AuthTokenStripeConnectAccountFields }
      : { stripeConnectAccount?: AuthTokenStripeConnectAccountFields }) &
    (IsSubscriptionDefinitelyPresent extends true
      ? { subscription: AuthTokenSubscriptionFields }
      : { subscription?: AuthTokenSubscriptionFields })
>;

/**
 * The {@link UserItem} fields in the auth token payload.
 */
export type AuthTokenUserFields = Pick<
  UserItem,
  "id" | "handle" | "email" | "phone" | "profile" | "stripeCustomerID" | "createdAt" | "updatedAt"
>;

/**
 * The {@link UserStripeConnectAccountItem} fields in the auth token payload.
 */
export type AuthTokenStripeConnectAccountFields = Pick<
  UserStripeConnectAccountItem,
  "id" | "detailsSubmitted" | "chargesEnabled" | "payoutsEnabled"
>;

/**
 * The {@link UserSubscriptionItem} fields in the auth token payload.
 */
export type AuthTokenSubscriptionFields = Pick<
  UserSubscriptionItem,
  "id" | "status" | "currentPeriodEnd"
>;
