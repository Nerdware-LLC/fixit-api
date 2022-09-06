import { signAndEncodeJWT, validateAndDecodeJWT } from "./jwt";

export class AuthToken {
  #tokenValue;

  constructor({
    id: userID,
    email,
    phone,
    profile,
    stripeCustomerID,
    stripeConnectAccount,
    subscription
  }) {
    const payload = {
      id: userID,
      email,
      phone,
      profile: {
        id: `${profile.id}`
      },
      stripeCustomerID,
      ...(stripeConnectAccount && {
        stripeConnectAccount: {
          id: stripeConnectAccount.id,
          detailsSubmitted: !!stripeConnectAccount.detailsSubmitted,
          chargesEnabled: !!stripeConnectAccount.chargesEnabled,
          payoutsEnabled: !!stripeConnectAccount.payoutsEnabled
        }
      }),
      ...(subscription && {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      })
    };

    this.#tokenValue = signAndEncodeJWT(payload);
  }

  toString() {
    return this.#tokenValue;
  }

  static validateAndDecodeAuthToken = async (authToken) => {
    return await validateAndDecodeJWT(authToken);
  };

  static getValidatedRequestAuthTokenPayload = async (request) => {
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
