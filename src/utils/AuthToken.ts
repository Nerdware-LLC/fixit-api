import {
  signAndEncodeJWT,
  validateAndDecodeJWT,
  INTERNAL_JWT_PAYLOAD_FIELDS,
  type FixitApiJwtPayload,
} from "./jwt";
import type { InternalDbUser } from "@types";
import type { Request } from "express";
import type { Simplify } from "type-fest";

export class AuthToken {
  private tokenValue;

  constructor({
    id: userID,
    handle,
    email,
    phone,
    profile,
    stripeCustomerID,
    stripeConnectAccount,
    subscription,
    createdAt,
    updatedAt,
  }: FixitApiAuthTokenPayloadUserData) {
    const payload: FixitApiAuthTokenPayloadUserData = {
      id: userID,
      handle,
      email,
      phone,
      profile,
      stripeCustomerID,
      stripeConnectAccount: {
        id: stripeConnectAccount.id,
        detailsSubmitted: !!stripeConnectAccount.detailsSubmitted,
        chargesEnabled: !!stripeConnectAccount.chargesEnabled,
        payoutsEnabled: !!stripeConnectAccount.payoutsEnabled,
      },
      ...(subscription && {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      }),
      createdAt,
      updatedAt,
    };

    this.tokenValue = signAndEncodeJWT(payload);
  }

  /**
   * This method returns the encoded auth token string.
   */
  toString() {
    return this.tokenValue;
  }

  /**
   * This method is called to validate and decode an encoded auth token.
   */
  static validateAndDecodeAuthToken = async (encodedAuthToken: string) => {
    return (await validateAndDecodeJWT(encodedAuthToken)) as FixitApiAuthTokenPayload;
  };

  /**
   * This method validates the request's "Authorization" header, and returns the
   * decoded payload if valid.
   */
  static getValidatedRequestAuthTokenPayload = async (request: Request) => {
    // Get token from "Authorization" header
    let token = request.get("Authorization");
    if (!token || typeof token !== "string") throw new Error("Invalid token");

    // Remove Bearer from string
    if (token.startsWith("Bearer ")) token = token.split(" ")[1];

    // Validate the token; if valid, return decoded payload
    const authTokenPayload = await this.validateAndDecodeAuthToken(token);

    if (!authTokenPayload) throw new Error("Invalid token");

    return authTokenPayload;
  };

  /**
   * This methods strips the following fields from the JWT payload (if present):
   * - `iss`
   * - `sub`
   * - `aud`
   * - `iat`
   * - `exp`
   * - `nbf`
   * - `jti`
   */
  static stripInternalJwtPayloadFields = (payload: FixitApiAuthTokenPayload) => {
    return Object.fromEntries(
      Object.entries(payload).filter(([key]) => !INTERNAL_JWT_PAYLOAD_FIELDS.includes(key))
    ) as FixitApiAuthTokenPayloadUserData;
  };
}

export type FixitApiAuthTokenPayload = FixitApiJwtPayload & FixitApiAuthTokenPayloadUserData;

export type FixitApiAuthTokenPayloadUserData = {
  id: InternalDbUser["id"];
  handle: InternalDbUser["handle"];
  email: InternalDbUser["email"];
  phone: InternalDbUser["phone"];
  profile: InternalDbUser["profile"];
  stripeCustomerID: InternalDbUser["stripeCustomerID"];
  stripeConnectAccount: Simplify<
    Pick<
      NonNullable<InternalDbUser["stripeConnectAccount"]>,
      "id" | "detailsSubmitted" | "chargesEnabled" | "payoutsEnabled"
    >
  >;
  subscription?: Simplify<
    Pick<NonNullable<InternalDbUser["subscription"]>, "id" | "status" | "currentPeriodEnd">
  >;
  createdAt: InternalDbUser["createdAt"];
  updatedAt: InternalDbUser["updatedAt"];
};
