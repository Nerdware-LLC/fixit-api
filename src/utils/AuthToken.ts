import { signAndEncodeJWT, validateAndDecodeJWT, type FixitApiJwtPayload } from "./jwt";
import type { UserType } from "@types";
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
  }: FixitApiAuthTokenPayload) {
    const payload: FixitApiAuthTokenPayload = {
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
    };

    this.tokenValue = signAndEncodeJWT(payload);
  }

  toString() {
    return this.tokenValue;
  }

  static validateAndDecodeAuthToken = async (encodedAuthToken: string) => {
    return (await validateAndDecodeJWT(encodedAuthToken)) as FixitApiAuthTokenPayload;
  };

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
}

export interface FixitApiAuthTokenPayload extends FixitApiJwtPayload {
  id: UserType["id"];
  handle: UserType["handle"];
  email: UserType["email"];
  phone: UserType["phone"];
  profile: UserType["profile"];
  stripeCustomerID: UserType["stripeCustomerID"];
  stripeConnectAccount: Simplify<
    Pick<
      NonNullable<UserType["stripeConnectAccount"]>,
      "id" | "detailsSubmitted" | "chargesEnabled" | "payoutsEnabled"
    >
  >;
  subscription?: Simplify<
    Pick<NonNullable<UserType["subscription"]>, "id" | "status" | "currentPeriodEnd">
  >;
}
